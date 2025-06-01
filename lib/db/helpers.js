import { NextResponse } from "next/server";
import { Validator } from "../validation";
import { customAlphabet } from "nanoid";
import { SignJWT } from "jose";
import { sql } from "kysely";
import { db } from "./db";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const discordErrorWebhook = process.env.DISCORD_ERROR_WEBHOOK;

if (!accessTokenSecret || !refreshTokenSecret) {
  throw new Error(
    "Please provide ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET in the .env file."
  );
}

export const sourceDefaultColumns = [
  "id",
  "publicId",
  "title",
  "medium",
  "url",
  "tags",
  "credits",
  "publishedAt",
  "lastAccessed",
  "createdAt",
];

export const noteDefaultColumns = [
  "id",
  "publicId",
  "title",
  "text",
  "tags",
  "createdAt",
];

export const quizDefaultColumns = [
  "id",
  "publicId",
  "type",
  "prompt",
  "choices",
  "answers",
  "hints",
  "tags",
  "createdAt",
];

export const courseDefaultColumns = [
  "id",
  "publicId",
  "name",
  "description",
  "enrollment",
  "createdAt",
];

export const userDefaultColumns = [
  "id",
  "publicId",
  "username",
  "displayName",
  "avatar",
  "createdAt",
];

export const permissionsDefaultColumns = [
  "allRead",
  "allWrite",
  "read",
  "write",
  "groupId",
  "groupLocked",
];

export async function catchRouteError({ error, route, skipApiResponse }) {
  console.error(`[ERROR] Error in ${route || "Unknown"}:`, error);

  await db
    .insertInto("error_logs")
    .values({
      route: route || "Unknown",
      name: error.name || "Unknown",
      message: error.message || "Unknown",
      code: error.code || "Unknown",
      stack: JSON.stringify(error.stack) || "Unknown",
    })
    .execute();

  if (discordErrorWebhook) {
    try {
      await fetch(discordErrorWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `**Error in ${route || "Unknown"}**\n\`\`\`json\n${JSON.stringify(
            {
              name: error.name || "Unknown",
              message: error.message || "Unknown",
              code: error.code || "Unknown",
              stack:
                error.stack.substring(0, 1998) +
                  (error.stack.length > 1998 ? "..." : "") || "Unknown",
            },
            null,
            4
          )}\n\`\`\``,
        }),
      });
    } catch (error) {
      console.error("[ERROR] Error sending error to Discord:", error);
    }
  }

  if (skipApiResponse) {
    return;
  }

  return NextResponse.json(
    {
      message: "Something went wrong.",
      errors: {
        server: "Something went wrong.",
      },
    },
    { status: 500 }
  );
}

export function getNanoId() {
  const alphabet = "123456789ABCDEFGHKMNPQRSTUVWXYZ";
  const nanoid = customAlphabet(alphabet, 6);
  return nanoid();
}

export function isValidId(id) {
  return Number.isInteger(id) && id > 0;
}

export async function isUserAssociate(userId, associateId) {
  try {
    const associate = await db
      .selectFrom("associates")
      .selectAll()
      .where(({ eb, and, or }) =>
        or([
          and([eb("A", "=", userId), eb("B", "=", associateId)]),
          and([eb("A", "=", associateId), eb("B", "=", userId)]),
        ])
      )
      .executeTakeFirst();

    return !!associate;
  } catch (error) {
    catchRouteError({ error, route: "isUserAssociate" });
    // Rather want to return true to prevent duplicate entries
    return true;
  }
}

/**
 *
 * @param {String} username
 * @param {Boolean} refresh
 * @returns {Promise<String | null>} token
 * @description Generate a JWT token for the user
 * @example getToken("John", false)
 * @example getToken("Jane", true)
 * @example getToken("Douglas")
 */
export async function getToken(username, refresh = false) {
  const accessSecret = new TextEncoder().encode(accessTokenSecret);
  const refreshSecret = new TextEncoder().encode(refreshTokenSecret);
  const url = process.env.BASE_URL || "http://localhost:3000";

  try {
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer(url)
      .setAudience(url)
      .setExpirationTime(refresh ? "30d" : "10m")
      .sign(refresh ? refreshSecret : accessSecret);

    return token;
  } catch (error) {
    catchRouteError({ error, route: "getToken" });
    return null;
  }
}

export async function doesUserExist(username) {
  try {
    const user = await db
      .selectFrom("users")
      .select("id")
      .where("username", "=", username)
      .executeTakeFirst();

    return !!user;
  } catch (error) {
    catchRouteError({ error, route: "doesUserExist" });
    return false;
  }
}

export function getResourcePermissions(type, id, eb) {
  return eb
    .selectFrom("resource_permissions as rp")
    .select(
      jsonObject({
        list: permissionsDefaultColumns,
        table: "rp",
      })
    )
    .where("resourceType", "=", type)
    .where("resourceId", "=", id)
    .as("permissions");
}

export function camelToSnake(str) {
  if (typeof str !== "string") {
    return str;
  }

  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function jsonArray({ ...args }) {
  return sql`JSON_ARRAYAGG(${jsonObject({ ...args })})`;
}

export function jsonObject({ list, table, subFields, eb }) {
  if (!list?.length || !table) {
    throw new Error("Invalid list or table.");
  }

  if (subFields?.length && !eb) {
    throw new Error("No eb provided for subFields.");
  }

  if (subFields?.length) {
    return sql`JSON_OBJECT(
            ${sql.raw(
              list
                .map((c) => {
                  if (c?.query) {
                    return `'${c.field}', ${c.query}`;
                  }

                  return `'${c}', ${table}.${camelToSnake(c)}`;
                })
                .join(", ")
            )}
            ${sql.raw(
              subFields
                .map(
                  ({
                    field,
                    table,
                    as,
                    columns,
                    condition,
                    multiple,
                    join,
                    asJoin,
                  }) => {
                    if (multiple && join) {
                      return `, '${field}', (SELECT IFNULL((SELECT JSON_ARRAYAGG(JSON_OBJECT(
                                    ${columns
                                      .map(
                                        (c) =>
                                          `'${c}', ${asJoin}.${camelToSnake(c)}`
                                      )
                                      .join(", ")}
                                    )) FROM ${table} as ${as} ${join} WHERE ${condition}), JSON_ARRAY()))`;
                    }

                    return `, '${field}', (SELECT JSON_OBJECT(
                                ${columns.map((c) => `'${c}', ${as}.${camelToSnake(c)}`).join(", ")}
                            ) FROM ${table} as ${as} WHERE ${condition})`;
                  }
                )
                .join("")
            )}
        )`;
  }

  return sql`JSON_OBJECT(
        ${sql.raw(
          list
            .map((c) => {
              if (c?.query) {
                return `'${c.field}', ${c.query}`;
              }

              return `'${c}', ${table}.${camelToSnake(c)}`;
            })
            .join(", ")
        )}
    )`;
}

export function firstLetterUpperCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function getPermittedResources({
  userId,
  groupId,
  canRead = true,
  canWrite = false,
  tagSearch,
  withSources = false,
  sourceIds = [],
  withNotes = false,
  noteIds = [],
  withQuizzes = false,
  quizIds = [],
  withCourses = false,
  courseIds = [],
  ids = [],
  publicIds = [],
  takeAll = false,
  offset = 0,
  limit = 10000,
}) {
  if (
    (!withSources && !withNotes && !withQuizzes && !withCourses && !takeAll) ||
    (!canRead && !canWrite)
  ) {
    return { sources: [], notes: [], quizzes: [], courses: [] };
  }

  function filterToPermitted({ eb, table, as, type, getHasMore }) {
    return eb
      .selectFrom(table)
      .select("id")
      .innerJoin("resource_permissions as rp", `${table}.id`, "rp.resourceId")
      .where("rp.resourceType", "=", type)
      .$if(ids.length, (eb) => eb.where("id", "in", ids))
      .$if(publicIds.length, (eb) => eb.where("publicId", "in", publicIds))
      .$if(tagSearch && type !== "course", (eb) =>
        eb.where(
          sql`JSON_CONTAINS(${sql.ref(`${table}.tags`)}, '"${sql.raw(tagSearch)}"')`
        )
      )
      .$if(!userId && !groupId, (eb) =>
        eb.where(({ eb, and, or }) =>
          and([
            or([eb("rp.allRead", "=", 1), eb("rp.allWrite", "=", 1)]),
            eb("rp.groupLocked", "=", 0),
          ])
        )
      )
      .$if(groupId, (eb) =>
        eb.where(({ eb, and, or }) =>
          or([
            eb("rp.groupId", "=", groupId),
            and([
              sql`JSON_CONTAINS(rp.read, ${groupId})`,
              sql`JSON_CONTAINS(rp.write, ${groupId})`,
              eb("rp.groupLocked", "=", 0),
            ]),
          ])
        )
      )
      .$if(userId, (eb) =>
        eb.where(({ eb, exists, or, and }) =>
          or([
            eb("createdBy", "=", userId),
            and([
              or([
                sql`JSON_CONTAINS(rp.read, ${userId})`,
                sql`JSON_CONTAINS(rp.write, ${userId})`,
                eb("rp.allRead", "=", 1),
                eb("rp.allWrite", "=", 1),
              ]),
              or([
                eb("rp.groupLocked", "=", 0),
                exists(
                  eb
                    .selectFrom("members")
                    .select("userId")
                    .where("userId", "=", userId)
                    .whereRef("groupId", "=", "rp.groupId")
                ),
              ]),
            ]),
          ])
        )
      )
      .orderBy("createdAt", "desc")
      .limit(getHasMore ? limit + 1 : limit)
      .offset(offset)
      .as(`${as}2`);
  }

  function helper(eb, table, as, type, columns, ids) {
    return eb
      .selectFrom(`${table} as ${as}`)
      .innerJoin(
        (eb) => filterToPermitted({ eb, table, as, type, ids }),
        (join) => join.onRef(`${as}.id`, "=", `${as}2.id`)
      )
      .select(({ eb }) => {
        const fields = [...columns];

        const addedFields = [
          {
            field: "creator",
            table: "users",
            as: "u",
            columns: ["id", "username", "displayName", "avatar"],
            condition: `u.id = ${as}.created_by`,
          },
          {
            field: "permissions",
            table: "resource_permissions",
            as: "rp",
            columns: permissionsDefaultColumns,
            condition: `rp.resource_id = ${as}.id AND rp.resource_type = "${type}"`,
          },
        ];

        if (type === "course") {
          // Get parent courses and prerequisite courses
          addedFields.push({
            field: "parents",
            table: "courses_hierarchy",
            as: "ch",
            columns: courseDefaultColumns,
            join: `INNER JOIN courses as c2 ON ch.superior = c2.id`,
            asJoin: "c2",
            condition: `ch.inferior = ${as}.id AND ch.relationship = "encompasses"`,
            multiple: true,
          });

          addedFields.push({
            field: "prerequisites",
            table: "courses_hierarchy",
            as: "ch",
            columns: courseDefaultColumns,
            join: `INNER JOIN courses as c2 ON ch.superior = c2.id`,
            asJoin: "c2",
            condition: `ch.inferior = ${as}.id AND ch.relationship = "prerequisite"`,
            multiple: true,
          });

          fields.push({
            field: "addAllFromSources",
            query: `IFNULL((SELECT include_reference FROM resource_relations WHERE B = ${as}.id AND B_type = "course" AND A_type = "source" LIMIT 1), 0)`,
          });

          fields.push({
            field: "addAllFromNotes",
            query: `IFNULL((SELECT include_reference FROM resource_relations WHERE B = ${as}.id AND B_type = "course" AND A_type = "note" LIMIT 1), 0)`,
          });
        }

        if (type === "quiz") {
          // Get quiz level from 'user_quizzes'
          fields.push({
            field: "level",
            query: `IFNULL((SELECT level FROM user_quizzes WHERE quiz_id = ${as}.id AND user_id = ${
              userId || null
            }), 0)`,
          });

          fields.push({
            field: "hiddenUntil",
            query: `IFNULL((SELECT hidden_until FROM user_quizzes WHERE quiz_id = ${as}.id AND user_id = ${userId || null}), 0)`,
          });

          // Get whether quiz needs multiple answers or not
          // To know this, we need to check if the answers json array has multiple values
          fields.push({
            field: "multipleAnswers",
            query: `JSON_LENGTH(${as}.answers) > 1`,
          });

          // Get the number of answers expected from the user (length of the answers json array)
          fields.push({
            field: "numOfAnswers",
            query: `JSON_LENGTH(${as}.answers)`,
          });
        }

        if (type === "source") {
          fields.push({
            field: "locationType",
            query: `IFNULL((SELECT reference_type FROM resource_relations WHERE A = ${as}.id AND A_type = "source" LIMIT 1), "page")`,
          });
        }

        return jsonArray({
          list: fields,
          table: as,
          subFields: addedFields,
          eb: eb,
        });
      })
      .orderBy(`${as}.createdAt`, "desc")
      .as(table);
  }

  try {
    const resources = await db
      .selectNoFrom((eb) => {
        const toSelect = [];

        if (withSources || takeAll) {
          toSelect.push(
            helper(
              eb,
              "sources",
              "s",
              "source",
              sourceDefaultColumns,
              sourceIds
            )
          );
        }

        if (withNotes || takeAll) {
          toSelect.push(
            helper(eb, "notes", "n", "note", noteDefaultColumns, noteIds)
          );
        }

        if (withQuizzes || takeAll) {
          toSelect.push(
            helper(eb, "quizzes", "q", "quiz", quizDefaultColumns, quizIds)
          );
        }

        if (withCourses || takeAll) {
          toSelect.push(
            helper(
              eb,
              "courses",
              "c",
              "course",
              courseDefaultColumns,
              courseIds
            )
          );
        }

        return toSelect;
      })
      .executeTakeFirstOrThrow();

    return {
      sources: resources.sources || [],
      notes: resources.notes || [],
      quizzes: resources.quizzes || [],
      courses: resources.courses || [],
    };
  } catch (error) {
    catchRouteError({ error, route: "getPermittedResources" });
    return { sources: [], notes: [], quizzes: [], courses: [] };
  }
}

export async function getRelationships() {
  try {
    return await db.selectFrom("resource_relations").selectAll().execute();
  } catch (e) {
    catchRouteError({ error, route: "getRelationships" });
  }
}

export async function isContributor(userId, resourceId, resourceType) {
  try {
    const contributor = await db
      .selectFrom("resource_contributors")
      .select("userId")
      .where("userId", "=", userId)
      .where("resourceId", "=", resourceId)
      .where("type", "=", resourceType)
      .executeTakeFirst();

    return !!contributor;
  } catch (error) {
    catchRouteError({ error, route: "isContributor" });
    return false;
  }
}

export async function removeRelations({ idA, typeA, typeB, relations }) {
  try {
    await db
      .deleteFrom("resource_relations")
      .where(({ eb, and }) =>
        and([
          eb("A", "=", idA),
          eb("A_type", "=", typeA),
          eb("B", "in", relations),
          eb("B_type", "=", typeB),
        ])
      )
      .execute();

    return true;
  } catch (error) {
    catchRouteError({ error, route: "removeRelations" });
    return false;
  }
}

export async function addRelationsNoDuplicates({
  idA,
  typeA,
  typeB,
  newRelations,
}) {
  try {
    await db
      .insertInto("resource_relations")
      .values(
        newRelations.map((id) => ({
          A: idA,
          B: id,
          A_type: typeA,
          B_type: typeB,
        }))
      )
      .execute();

    return true;
  } catch (error) {
    catchRouteError({ error, route: "addRelationsNoDuplicates" });
    return false;
  }
}

export async function updateContributor({ resourceId, contributorId, type }) {
  try {
    if (!isValidId(contributorId)) {
      throw new Error("Invalid contributor ID.");
    }

    if (!(await isContributor(contributorId, resourceId, type))) {
      await db
        .insertInto("resource_contributors")
        .values({
          userId: contributorId,
          resourceId,
          type,
        })
        .execute();
    }

    return true;
  } catch (error) {
    catchRouteError({ error, route: "updateContributor" });
    return false;
  }
}

export async function updateSource({
  id,
  title,
  medium,
  url,
  publishedAt,
  lastAccessed,
  contributorId,
  tags,
  authors,
  courses,
  permissions: perm,
}) {
  const validator = new Validator();

  validator.validateAll(
    [
      [title, "title"],
      [medium, "medium"],
      [url, "url"],
      [publishedAt, "publishedAt"],
      [lastAccessed, "lastAccessed"],
      [authors, "authors"],
      [courses, "courses"],
    ].map(([value, field]) => ({ field, value })),
    "source"
  );

  validator.validate({
    field: "tags",
    value: tags,
    type: "misc",
  });

  let permissions;
  if (perm) {
    permissions = validator.validatePermissions(perm, true);
  }

  if (!validator.isValid) {
    return {
      valid: false,
      errors: validator.errors,
    };
  }

  try {
    if (
      title ||
      medium ||
      url ||
      publishedAt ||
      lastAccessed ||
      tags ||
      authors
    ) {
      await db
        .updateTable("sources")
        .set({
          title,
          medium,
          url,
          publishedAt,
          lastAccessed,
          tags: tags ? JSON.stringify(tags) : undefined,
          credits: authors ? JSON.stringify(authors) : undefined,
        })
        .where("id", "=", id)
        .execute();
    }

    await updateContributor({
      resourceId: id,
      contributorId,
      type: "source",
    });

    if (courses?.length) {
      // Remove courses that are no longer associated with the source
      await removeRelations({
        idA: id,
        typeA: "source",
        typeB: "course",
        relations: courses,
      });

      // Add new courses
      await addRelationsNoDuplicates({
        idA: id,
        typeA: "source",
        typeB: "course",
        newRelations: courses,
      });
    }

    if (permissions) {
      await db
        .updateTable("resource_permissions")
        .set({ ...permissions })
        .where("resourceId", "=", id)
        .where("resourceType", "=", "source")
        .execute();
    }

    return {
      valid: validator.isValid,
      errors: validator.errors,
    };
  } catch (error) {
    return catchRouteError({
      error,
      route: "updateSource",
      skipApiResponse: true,
    });
  }
}

export async function updateNote({
  id,
  title,
  text,
  tags,
  sources,
  courses,
  permissions: perm,
  contributorId,
}) {
  const validator = new Validator();

  validator.validateAll(
    [
      [title, "title"],
      [text, "text"],
      [sources, "sources"],
      [courses, "courses"],
    ].map(([value, field]) => ({ field, value })),
    "note"
  );

  validator.validate({
    field: "tags",
    value: tags,
    type: "misc",
  });

  let permissions;
  if (perm) {
    permissions = validator.validatePermissions(perm, true);
  }

  if (!validator.isValid) {
    return {
      valid: false,
      errors: validator.errors,
    };
  }

  try {
    if (title || text || tags) {
      await db
        .updateTable("notes")
        .set({
          title,
          text,
          tags: tags ? JSON.stringify(tags) : undefined,
        })
        .where("id", "=", id)
        .execute();
    }

    await updateContributor({
      resourceId: id,
      contributorId,
      type: "note",
    });

    [
      [sources, "source"],
      [courses, "course"],
    ].forEach(async ([resources, type]) => {
      if (resources?.length) {
        // Remove resources that are no longer associated with the note
        await removeRelations({
          idA: id,
          typeA: "note",
          typeB: type,
          relations: resources,
        });

        // Add new resources
        await addRelationsNoDuplicates({
          idA: id,
          typeA: "note",
          typeB: type,
          newRelations: resources,
        });
      }
    });

    if (permissions) {
      await db
        .updateTable("resource_permissions")
        .set({ ...permissions })
        .where("resourceId", "=", id)
        .where("resourceType", "=", "note")
        .execute();
    }

    return {
      valid: validator.isValid,
      errors: validator.errors,
    };
  } catch (error) {
    return catchRouteError({ error, route: "updateNote" });
  }
}

export async function updateQuiz({
  id,
  type,
  prompt,
  choices,
  answers,
  hints,
  tags,
  sources,
  notes,
  courses,
  permissions: perm,
  contributorId,
}) {
  const validator = new Validator();

  validator.validateAll(
    [
      [type, "type"],
      [prompt, "prompt"],
      [choices, "choices"],
      [answers, "answers"],
      [hints, "hints"],
      [sources, "sources"],
      [notes, "notes"],
      [courses, "courses"],
    ].map(([value, field]) => ({ field, value })),
    "quiz"
  );

  validator.validate({
    field: "tags",
    value: tags,
    type: "misc",
  });

  let permissions;
  if (perm) {
    permissions = validator.validatePermissions(perm, true);
  }

  if (!validator.isValid) {
    return {
      valid: false,
      errors: validator.errors,
    };
  }

  try {
    if (type || prompt || choices || answers || hints || tags) {
      await db
        .updateTable("quizzes")
        .set({
          type,
          prompt,
          choices: choices ? JSON.stringify(choices) : undefined,
          answers: answers ? JSON.stringify(answers) : undefined,
          hints: hints ? JSON.stringify(hints) : undefined,
          tags: tags ? JSON.stringify(tags) : undefined,
        })
        .where("id", "=", id)
        .execute();
    }

    await updateContributor({
      resourceId: id,
      contributorId,
      type: "quiz",
    });

    [
      [sources, "source"],
      [notes, "note"],
      [courses, "course"],
    ].forEach(async ([resources, type]) => {
      if (resources?.length) {
        // Remove resources that are no longer associated with the quiz
        await removeRelations({
          idA: id,
          typeA: "quiz",
          typeB: type,
          relations: resources,
        });

        // Add new resources
        await addRelationsNoDuplicates({
          idA: id,
          typeA: "quiz",
          typeB: type,
          newRelations: resources,
        });
      }
    });

    if (permissions) {
      await db
        .updateTable("resource_permissions")
        .set({ ...permissions })
        .where("resourceId", "=", id)
        .where("resourceType", "=", "quiz")
        .execute();
    }

    return {
      valid: validator.isValid,
      errors: validator.errors,
    };
  } catch (error) {
    return catchRouteError({ error, route: "updateQuiz" });
  }
}

export async function updateCourse({
  id,
  name,
  description,
  enrollment,
  parents,
  prerequisites,
  sources,
  notes,
  quizzes,
  addAllFromSources,
  addAllFromNotes,
  permissions: perm,
  contributorId,
}) {
  const validator = new Validator();

  validator.validateAll(
    [
      [name, "name"],
      [description, "description"],
      [enrollment, "enrollment"],
      [parents, "parents"],
      [prerequisites, "prerequisites"],
      [sources, "sources"],
      [notes, "notes"],
      [quizzes, "quizzes"],
      [addAllFromSources, "addAllFromSources"],
      [addAllFromNotes, "addAllFromNotes"],
    ].map(([value, field]) => ({ field, value })),
    "course"
  );

  let permissions;
  if (perm) {
    permissions = validator.validatePermissions(perm, true);
  }

  if (!validator.isValid) {
    return {
      valid: false,
      errors: validator.errors,
    };
  }

  try {
    if (name || description || enrollment) {
      await db
        .updateTable("courses")
        .set({
          name,
          description,
          enrollment,
        })
        .where("id", "=", id)
        .execute();
    }

    await updateContributor({
      resourceId: id,
      contributorId,
      type: "course",
    });

    if (parents?.length) {
      await db
        .insertInto("courses_hierarchy")
        .values(
          parents.map((p) => ({
            inferior: id,
            superior: p,
            relationship: "encompasses",
            averageLevelRequired: 0,
            minimumLevelRequired: 0,
          }))
        )
        .execute();
    }

    if (prerequisites?.length) {
      await db
        .insertInto("courses_hierarchy")
        .values(
          prerequisites.map((p) => ({
            inferior: id,
            superior: p,
            relationship: "prerequisite",
            // averageLevelRequired: p?.averageLevelRequired || 0,
            // minimumLevelRequired: p?.minimumLevelRequired || 0,
          }))
        )
        .execute();
    }

    [
      ["source", sources],
      ["note", notes],
      ["quiz", quizzes],
    ].forEach(async ([type, resources]) => {
      if (resources?.length) {
        // Remove resources that are no longer associated with the course
        await removeRelations({
          idA: id,
          typeA: "course",
          typeB: type,
          relations: resources,
        });

        // Add new resources
        await addRelationsNoDuplicates({
          idA: id,
          typeA: "course",
          typeB: type,
          newRelations: resources,
        });
      }
    });

    if (permissions) {
      await db
        .updateTable("resource_permissions")
        .set({ ...permissions })
        .where("resourceId", "=", id)
        .where("resourceType", "=", "course")
        .execute();
    }

    return {
      valid: validator.isValid,
      errors: validator.errors,
    };
  } catch (error) {
    return catchRouteError({ error, route: "updateCourse" });
  }
}

export async function canUnenrollFromCourse(userId, courseId) {
  try {
    const course = await db
      .selectFrom("courses")
      .select("id")
      .where("id", "=", courseId)
      .where(({ eb, exists, and, selectFrom }) =>
        and([
          exists(
            selectFrom("course_users")
              .where("userId", "=", userId)
              .whereRef("courseId", "=", "courses.id")
          ),
          eb("createdBy", "!=", userId),
        ])
      )
      .executeTakeFirst();

    return !!course;
  } catch (error) {
    catchRouteError({ error, route: "canUnenrollFromCourse" });
    return false;
  }
}

export async function canEnrollInCourse(userId, courseId) {
  try {
    const course = await db
      .selectFrom("courses")
      .select("id")
      .where("id", "=", courseId)
      .where("createdBy", "!=", userId)
      .where("enrollment", "=", "open")
      .where(({ exists, not, selectFrom }) =>
        not(
          exists(
            selectFrom("course_users")
              .where("userId", "=", userId)
              .whereRef("courseId", "=", "courses.id")
          )
        )
      )
      .executeTakeFirst();

    return !!course;
  } catch (error) {
    catchRouteError({ error, route: "canEnrollInCourse" });
    return false;
  }
}

export async function getGroups(userId, permitted = false) {
  if (!isValidId(userId) && !permitted) {
    return [];
  }

  try {
    const groups = await db
      .selectFrom("groups")
      .select(({ eb, selectFrom }) => [
        "id",
        "publicId",
        "name",
        "description",
        "isPublic",
        "icon",
        "createdBy",
        "createdAt",
        selectFrom("members as m")
          .innerJoin("users as u", "m.userId", "u.id")
          .select(
            sql`JSON_ARRAYAGG(JSON_OBJECT(
                            'id', u.id,
                            'username', u.username,
                            'displayName', u.display_name,
                            'avatar', u.avatar,
                            'role', m.role
                        ))`
          )
          .whereRef("m.groupId", "=", "groups.id")
          .as("members"),
      ])
      .where(({ eb, or, exists }) => {
        const ors = [];

        if (isValidId(userId)) {
          ors.push(
            exists(
              eb
                .selectFrom("members")
                .select("userId")
                .where("userId", "=", userId)
                .whereRef("groupId", "=", "groups.id")
            )
          );
        }

        // If permitted is true, we also want to include public groups
        if (permitted) {
          ors.push(eb("isPublic", "=", 1));
        }

        return or(ors);
      })
      .execute();

    return groups || [];
  } catch (error) {
    catchRouteError({ error, route: "getPermittedGroups" });
    return [];
  }
}

export async function getGroup({ id, toSelect = ["id"], getMembers = false }) {
  try {
    const group = await db
      .selectFrom("groups")
      .select(({ selectFrom }) => {
        const select = toSelect;

        if (getMembers) {
          select.push(
            selectFrom("members as m")
              .innerJoin("users as u", "m.userId", "u.id")
              .select(
                sql`JSON_ARRAYAGG(JSON_OBJECT(
                            'id', u.id,
                            'username', u.username,
                            'displayName', u.display_name,
                            'avatar', u.avatar
                        ))`
              )
              .whereRef("m.groupId", "=", "groups.id")
              .as("members")
          );
        }

        return select;
      })
      .where("id", "=", id)
      .executeTakeFirst();

    return group;
  } catch (error) {
    catchRouteError({ error, route: "getPermittedGroups" });
    return null;
  }
}

export async function canUserWriteToGroup(userId, groupId) {
  try {
    const group = await db
      .selectFrom("groups")
      .innerJoin("members", "groups.id", "members.groupId")
      .select(["id", "role"])
      .where("id", "=", groupId)
      .where(({ eb, or }) =>
        or([
          eb("createdBy", "=", userId),
          eb(sql`JSON_CONTAINS(write, '${userId}')`),
          eb("role", "=", "admin"),
          eb("role", "=", "owner"),
        ])
      )
      .executeTakeFirst();

    return !!group;
  } catch (error) {
    catchRouteError({ error, route: "canUserWriteToGroup" });
    return false;
  }
}

export async function isUserInGroup(userId, groupId) {
  try {
    const group = await db
      .selectFrom("members")
      .select("userId")
      .where("userId", "=", userId)
      .where("groupId", "=", groupId)
      .executeTakeFirst();

    return !!group;
  } catch (error) {
    catchRouteError({ error, route: "canUserJoinGroup" });
    return false;
  }
}

export async function isGroupNameTaken(name) {
  try {
    const sameName = await db
      .selectFrom("groups")
      .select("id")
      .where("name", "=", name)
      .execute();

    return sameName.length > 0;
  } catch (error) {
    throw new Error("Error checking if group name is taken.");
  }
}

export async function getCourses({ names }) {
  try {
    const course = await db
      .selectFrom("courses as c")
      .selectAll("c")
      .select(({ selectFrom }) => [
        selectFrom("resource_permissions as rp")
          .select(
            jsonObject({
              list: permissionsDefaultColumns,
              table: "rp",
            })
          )
          .whereRef("rp.resourceId", "=", "c.id")
          .where("rp.resourceType", "=", "course")
          .as("permissions"),
        selectFrom("resource_relations as r")
          .innerJoin("sources as s", "r.B", "s.id")
          .select(
            jsonArray({
              list: sourceDefaultColumns,
              table: "s",
            })
          )
          .whereRef("r.A", "=", "c.id")
          .as("sources"),
        selectFrom("resource_relations as r")
          .innerJoin("quizzes as q", "r.B", "q.id")
          .select(
            jsonArray({
              list: quizDefaultColumns,
              table: "q",
            })
          )
          .whereRef("r.A", "=", "c.id")
          .as("quizzes"),
        selectFrom("resource_relations as r")
          .innerJoin("notes as n", "r.B", "n.id")
          .select(
            jsonArray({
              list: noteDefaultColumns,
              table: "n",
            })
          )
          .whereRef("r.A", "=", "c.id")
          .as("notes"),
      ])
      .where("c.name", "in", names)
      .executeTakeFirst();

    return course;
  } catch (error) {
    catchRouteError({ error, route: "getCourse" });
    return null;
  }
}

export async function getCourse({ name }) {
  try {
    const course = await db
      .selectFrom("courses as c")
      .selectAll("c")
      .select(({ selectFrom }) => [
        selectFrom("resource_permissions as rp")
          .select(
            jsonObject({
              list: permissionsDefaultColumns,
              table: "rp",
            })
          )
          .whereRef("rp.resourceId", "=", "c.id")
          .where("rp.resourceType", "=", "course")
          .as("permissions"),
        selectFrom("resource_relations as r")
          .innerJoin("sources as s", "r.B", "s.id")
          .select(
            jsonArray({
              list: sourceDefaultColumns,
              table: "s",
            })
          )
          .whereRef("r.A", "=", "c.id")
          .as("sources"),
        selectFrom("resource_relations as r")
          .innerJoin("quizzes as q", "r.B", "q.id")
          .select(
            jsonArray({
              list: quizDefaultColumns,
              table: "q",
            })
          )
          .whereRef("r.A", "=", "c.id")
          .as("quizzes"),
        selectFrom("resource_relations as r")
          .innerJoin("notes as n", "r.B", "n.id")
          .select(
            jsonArray({
              list: noteDefaultColumns,
              table: "n",
            })
          )
          .whereRef("r.A", "=", "c.id")
          .as("notes"),
        selectFrom("courses_hierarchy as ch")
          .innerJoin("courses as c2", "ch.superior", "c2.id")
          .select(
            jsonArray({
              list: courseDefaultColumns,
              table: "c2",
            })
          )
          .whereRef("ch.inferior", "=", "c.id")
          .where("ch.relationship", "=", "encompasses")
          .as("parents"),
        selectFrom("courses_hierarchy as ch")
          .innerJoin("courses as c2", "ch.superior", "c2.id")
          .select(
            jsonArray({
              list: courseDefaultColumns,
              table: "c2",
            })
          )
          .whereRef("ch.inferior", "=", "c.id")
          .where("ch.relationship", "=", "prerequisite")
          .as("prerequisites"),
      ])
      .where("c.name", "=", name)
      .executeTakeFirst();

    return {
      ...course,
      sources: course.sources || [],
      quizzes: course.quizzes || [],
      notes: course.notes || [],
      parents: course.parents || [],
      prerequisites: course.prerequisites || [],
    };
  } catch (error) {
    catchRouteError({ error, route: "getCourse" });
    return null;
  }
}

export async function getSources({ publicIds }) {
  try {
    const sources = await db
      .selectFrom("sources as s")
      .selectAll("s")
      .select(({ selectFrom }) => [
        selectFrom("resource_permissions as rp")
          .select(
            jsonObject({
              list: permissionsDefaultColumns,
              table: "rp",
            })
          )
          .whereRef("rp.resourceId", "=", "s.id")
          .where("rp.resourceType", "=", "source")
          .as("permissions"),
        selectFrom("resource_relations as r")
          .innerJoin("courses as c", "r.B", "c.id")
          .select(
            jsonArray({
              list: courseDefaultColumns,
              table: "c",
            })
          )
          .whereRef("r.A", "=", "s.id")
          .as("courses"),
      ])
      .where("publicId", "in", publicIds)
      .execute();

    return sources;
  } catch (error) {
    catchRouteError({ error, route: "getSources" });
    return [];
  }
}

export async function doesResourceExist(resourceId, resourceType) {
  try {
    const resource = await db
      .selectFrom(resourceType)
      .select("id")
      .where("id", "=", resourceId)
      .executeTakeFirst();

    return !!resource;
  } catch (error) {
    catchRouteError({ error, route: "doesResourceExist" });
    return false;
  }
}

export async function canEditResource(userId, resourceId, table, resourceType) {
  try {
    const resource = await db
      .selectFrom("resource_permissions")
      .innerJoin(table, "resource_permissions.resourceId", `${table}.id`)
      .select("resourceId")
      .where("resourceId", "=", resourceId)
      .where("resourceType", "=", resourceType)
      .where(({ eb, or }) =>
        or([
          eb("createdBy", "=", userId),
          eb("allWrite", "=", 1),
          sql`JSON_CONTAINS(\`write\`, '${userId}')`,
        ])
      )
      .executeTakeFirst();

    return !!resource;
  } catch (error) {
    catchRouteError({ error, route: "canEditResource" });
    return false;
  }
}

export async function canDeleteResource(userId, resourceId, resourceType) {
  try {
    const resource = await db
      .selectFrom(resourceType)
      .select("id")
      .where("id", "=", resourceId)
      .where("createdBy", "=", userId)
      .executeTakeFirst();

    return !!resource;
  } catch (error) {
    catchRouteError({ error, route: "canDeleteResource" });
    return false;
  }
}

export async function doesUserMeetPrerequisites(courseId) {
  // Need to get all the prerequisites for the course and join those prerequisites' related course to get the `progress` field
  try {
    const prerequisites = await db
      .selectFrom("courses_hierarchy as p")
      .innerJoin("courses as c", "p.superior", "c.id")
      .select([
        "p.averageLevelRequired",
        "p.minimumLevelRequired",
        "c.progress",
      ])
      .where("p.inferior", "=", courseId)
      .where("p.relationship", "=", "prerequisite")
      .execute();

    return prerequisites.every((p) => p.progress >= p.minimumLevelRequired);
  } catch (error) {
    catchRouteError({ error, route: "doesUserMeetPrerequisites" });
    return false;
  }
}

export async function isUserBlocked(user1, user2) {
  try {
    const blocked = await db
      .selectFrom("blocked")
      .select("id")
      .where(({ eb, or, and }) =>
        or([
          and([eb("blocker", "=", user1), eb("blocked", "=", user2)]),
          and([eb("blocker", "=", user2), eb("blocked", "=", user1)]),
        ])
      )
      .executeTakeFirst();

    return !!blocked;
  } catch (error) {
    catchRouteError({ error, route: "isUserBlocked" });
    return false;
  }
}
