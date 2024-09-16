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
    throw new Error("No access or refresh token secrets found.");
}

const sourceDefaultColumns = [
    "id",
    "title",
    "medium",
    "url",
    "tags",
    "credits",
    "publishedAt",
    "lastAccessed",
    "createdAt",
];

const noteDefaultColumns = ["id", "title", "text", "tags", "createdAt"];

const quizDefaultColumns = [
    "id",
    "type",
    "prompt",
    "choices",
    "answers",
    "hints",
    "tags",
    "createdAt",
];

const courseDefaultColumns = [
    "id",
    "name",
    "description",
    "enrollment",
    "createdAt",
];

const userDefaultColumns = [
    "id",
    "username",
    "displayName",
    "avatar",
    "createdAt",
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
                                    (error.stack.length > 1998 ? "..." : "") ||
                                "Unknown",
                        },
                        null,
                        4,
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
            message: "Something went wrong. Please try again later.",
            errors: {
                server: "Something went wrong. Please try again later.",
            },
        },
        { status: 500 },
    );
}

export function getNanoId() {
    const alphabet = "123456789ABCDEFGHKMNPQRSTUVWXYZ";
    const nanoid = customAlphabet(alphabet, 12);
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
                ]),
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

export async function getPermittedResources({
    userId,
    groupId,
    withSources = false,
    sourcesColumns = sourceDefaultColumns,
    withNotes = false,
    notesColumns = noteDefaultColumns,
    withQuizzes = false,
    quizzesColumns = quizDefaultColumns,
    withCourses = false,
    coursesColumns = courseDefaultColumns,
    withCreator = true,
    creatorColumns = userDefaultColumns,
    takeAll = false,
}) {
    if (
        !withSources &&
        !withNotes &&
        !withQuizzes &&
        !withCourses &&
        !takeAll
    ) {
        return { sources: [], notes: [], quizzes: [], courses: [] };
    }

    function camelToSnake(str) {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    }

    function helper(eb, table, as, type, columns) {
        return eb
            .selectFrom(`${table} as ${as}`)
            .select(() => {
                if (withCreator) {
                    return sql`JSON_ARRAYAGG(JSON_OBJECT(
                        ${sql.raw(columns.map((c) => `'${c}', ${as}.${camelToSnake(c)}`).join(", "))}
                        ${sql.raw(`, 'creator', (SELECT JSON_OBJECT(${creatorColumns.map((c) => `'${c}', u.${camelToSnake(c)}`).join(", ")})`)}
                        ${sql.raw(`FROM users u WHERE u.id = ${as}.created_by)`)}
                    ))`;
                }

                return sql`JSON_ARRAYAGG(JSON_OBJECT(${sql.raw(columns.map((c) => `'${c}', ${as}.${camelToSnake(c)}`).join(", "))}))`;
            })
            .innerJoin(
                "resource_permissions as rp",
                `${as}.id`,
                "rp.resourceId",
            )
            .where("rp.resourceType", "=", type)
            .$if(!userId && !groupId, (eb) =>
                eb.where(({ eb, and }) =>
                    and([
                        eb("rp.allRead", "=", 1),
                        eb("rp.groupLocked", "=", 0),
                    ]),
                ),
            )
            .$if(groupId, (eb) =>
                eb.where(({ eb, or }) =>
                    or([
                        eb("rp.groupId", "=", groupId),
                        // eb(sql`JSON_CONTAINS(rp.read, ${groupId})`),
                    ]),
                ),
            )
            .$if(userId, (eb) =>
                eb.where(({ eb, exists, or, and }) =>
                    or([
                        eb(`${as}.createdBy`, "=", userId),
                        // eb(sql`JSON_CONTAINS(rp.read, ${userId})`),
                        and([
                            eb("rp.allRead", "=", 1),
                            or([
                                eb("rp.groupLocked", "=", 0),
                                exists(
                                    eb
                                        .selectFrom("members")
                                        .select("userId")
                                        .where("userId", "=", userId)
                                        .whereRef("groupId", "=", "rp.groupId"),
                                ),
                            ]),
                        ]),
                    ]),
                ),
            )
            .as(table);
    }

    try {
        const resources = await db
            .selectNoFrom((eb) => {
                const toSelect = [];

                if (withSources || takeAll) {
                    toSelect.push(
                        helper(eb, "sources", "s", "source", sourcesColumns),
                    );
                }

                if (withNotes || takeAll) {
                    toSelect.push(
                        helper(eb, "notes", "n", "note", notesColumns),
                    );
                }

                if (withQuizzes || takeAll) {
                    toSelect.push(
                        helper(eb, "quizzes", "q", "quiz", quizzesColumns),
                    );
                }

                if (withCourses || takeAll) {
                    toSelect.push(
                        helper(eb, "courses", "c", "course", coursesColumns),
                    );
                }

                return toSelect;
            })
            .executeTakeFirstOrThrow();

        console.log("Permitted resources:", JSON.stringify(resources, null, 4));

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
                ]),
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
                })),
            )
            // No duplicates, so need to check if the relation already exists
            .where(({ eb, not, exists }) =>
                not(
                    exists(
                        eb
                            .selectFrom("resource_relations")
                            .where("A", "=", idA)
                            .where("A_type", "=", typeA)
                            .where("B", "in", newRelations)
                            .where("B_type", "=", typeB),
                    ),
                ),
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
        "source",
    );

    validator.validate({
        field: "tags",
        value: tags,
        type: "misc",
    });

    const permissions = validator.validatePermissions(perm);

    if (!validator.isValid) {
        return {
            valid: false,
            errors: validator.errors,
        };
    }

    try {
        await db
            .updateTable("sources")
            .values({
                title,
                medium,
                url,
                publishedAt,
                lastAccessed,
                tags: JSON.stringify(tags),
                credits: JSON.stringify(authors),
            })
            .where("id", "=", id)
            .execute();

        await updateContributor({
            resourceId: id,
            contributorId,
            type: "source",
        });

        if (courses.length) {
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
                .values(permissions)
                .where("resourceId", "=", id)
                .where("resourceType", "=", "source")
                .execute();
        }

        return {
            valid: validator.isValid,
            errors: validator.errors,
        };
    } catch (error) {
        return catchRouteError({ error, route: "updateSource" });
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
        "note",
    );

    validator.validate({
        field: "tags",
        value: tags,
        type: "misc",
    });

    const permissions = validator.validatePermissions(perm);

    if (!validator.isValid) {
        return {
            valid: false,
            errors: validator.errors,
        };
    }

    try {
        await db
            .updateTable("notes")
            .values({
                title,
                text,
                tags: JSON.stringify(tags),
            })
            .where("id", "=", id)
            .execute();

        await updateContributor({
            resourceId: id,
            contributorId,
            type: "note",
        });

        [
            [sources, "source"],
            [courses, "course"],
        ].forEach(async ([resources, type]) => {
            if (resources.length) {
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
                .values(permissions)
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
        "quiz",
    );

    validator.validate({
        field: "tags",
        value: tags,
        type: "misc",
    });

    const permissions = validator.validatePermissions(perm);

    if (!validator.isValid) {
        return {
            valid: false,
            errors: validator.errors,
        };
    }

    try {
        await db
            .updateTable("quizzes")
            .values({
                type,
                prompt,
                choices: JSON.stringify(choices),
                answers: JSON.stringify(answers),
                hints: JSON.stringify(hints),
                tags: JSON.stringify(tags),
            })
            .where("id", "=", id)
            .execute();

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
            if (resources.length) {
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
                .values(permissions)
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
        "course",
    );

    const permissions = validator.validatePermissions(perm);

    if (!validator.isValid) {
        return {
            valid: false,
            errors: validator.errors,
        };
    }

    try {
        await db
            .updateTable("courses")
            .values({
                name,
                description,
                enrollment,
            })
            .where("id", "=", id)
            .execute();

        await updateContributor({
            resourceId: id,
            contributorId,
            type: "course",
        });

        if (parents.length) {
            await db
                .insertInto("courses_hierarchy")
                .values(
                    parents.map((p) => ({
                        inferior: id,
                        superior: p,
                        relationship: "encompasses",
                        averageLevelRequired: 0,
                        minimumLevelRequired: 0,
                    })),
                )
                .execute();
        }

        if (prerequisites.length) {
            await db
                .insertInto("courses_hierarchy")
                .values(
                    prerequisites.map((p) => ({
                        inferior: id,
                        superior: p,
                        relationship: "prerequisite",
                        // averageLevelRequired: p?.averageLevelRequired || 0,
                        // minimumLevelRequired: p?.minimumLevelRequired || 0,
                    })),
                )
                .execute();
        }

        [
            ["source", sources],
            ["note", notes],
            ["quiz", quizzes],
        ].forEach(async ([type, resources]) => {
            if (resources.length) {
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
                .values(permissions)
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
                            .whereRef("courseId", "=", "courses.id"),
                    ),
                    eb("createdBy", "!=", userId),
                ]),
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
                            .whereRef("courseId", "=", "courses.id"),
                    ),
                ),
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
            .select(({ eb }) => [
                "id",
                "name",
                "description",
                "isPublic",
                "icon",
                withMembers({ eb, userId }),
            ])
            .where(({ eb, or, exists }) => {
                const ors = [];

                if (!permitted) {
                    ors.push(
                        exists(
                            eb
                                .selectFrom("members")
                                .where("userId", "=", userId)
                                .whereRef("groupId", "=", "groups.id"),
                        ),
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

export async function withMembers({ eb, userId }) {
    return eb(
        sql`JSON_ARRAYAGG(JSON_OBJECT(
            'id', m.userId,
            'username', u.username,
            'displayName', u.displayName,
            'avatar', u.avatar
        ))`,
    )
        .innerJoin("users as u", "m.userId", "u.id")
        .whereRef("m.groupId", "groups.id")
        .where("m.userId", "!=", userId);
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

export async function canEditResource(userId, resourceId, resourceType) {
    try {
        const resource = await db
            .selectFrom("resource_permissions")
            .innerJoin(
                resourceType,
                "resource_permissions.resourceId",
                `${resourceType}.id`,
            )
            .select("resourceId")
            .where("resourceId", "=", resourceId)
            .where("resourceType", "=", resourceType)
            .where(({ eb, or }) =>
                or([
                    eb("createdBy", "=", userId),
                    eb("allWrite", "=", 1),
                    eb(sql`JSON_CONTAINS(write, '${userId}')`),
                ]),
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
