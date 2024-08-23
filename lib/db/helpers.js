import { sqlDate } from "../date";
import { db } from "./db";

export async function getPermittedResources(userId) {
    const resources = {
        sources: [],
        notes: [],
        quizzes: [],
        courses: [],
        users: [],
    };

    const baseQuery = `
(
    SELECT 
        \`Sources\`.\`id\` AS \`id\`, 
        \`Sources\`.\`title\` AS \`title\`, 
        \`Sources\`.\`medium\` AS \`medium\`, 
        \`Sources\`.\`url\` AS \`url\`, 
        \`Sources\`.\`tags\` AS \`tags\`, 
        \`Sources\`.\`createdBy\` AS \`createdBy\`, 
        \`Sources\`.\`publishedUpdated\` AS \`publishedUpdated\`, 
        \`Sources\`.\`lastAccessed\`, 
        NULL AS \`text\`, 
        NULL AS \`type\`, 
        NULL AS \`prompt\`, 
        NULL AS \`choices\`, 
        NULL AS \`correctResponses\`, 
        NULL AS \`hints\`, 
        \`ResourcePermissions\`.\`resourceType\` 
    FROM \`ResourcePermissions\` 
    LEFT JOIN \`Sources\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Sources\`.\`id\` 
        AND \`ResourcePermissions\`.\`resourceType\` = 'source'
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'source' 
        AND (
            \`ResourcePermissions\`.\`permitAll\` = 1 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND \`ResourcePermissions\`.\`permittedId\` = ?) 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND \`ResourcePermissions\`.\`permittedId\` IN (
                SELECT \`groupId\` 
                FROM \`Members\` 
                WHERE \`userId\` = ?
                )
            )
        )
) 
UNION 
(
    SELECT 
        \`Notes\`.\`id\` AS \`id\`, 
        \`Notes\`.\`title\` AS \`title\`, 
        NULL AS \`medium\`, 
        NULL AS \`url\`, 
        \`Notes\`.\`tags\` AS \`tags\`, 
        \`Notes\`.\`createdBy\` AS \`createdBy\`, 
        NULL AS \`publishedUpdated\`, 
        NULL AS \`lastAccessed\`, 
        \`Notes\`.\`text\` AS \`text\`, 
        NULL AS \`type\`, 
        NULL AS \`prompt\`, 
        NULL AS \`choices\`, 
        NULL AS \`correctResponses\`, 
        NULL AS \`hints\`, 
        \`ResourcePermissions\`.\`resourceType\` 
    FROM \`ResourcePermissions\` 
    LEFT JOIN \`Notes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Notes\`.\`id\` 
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'note' 
        AND (
            \`ResourcePermissions\`.\`permitAll\` = 1 
            OR
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND 
            \`ResourcePermissions\`.\`permittedId\` = ?) 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND 
                \`ResourcePermissions\`.\`permittedId\` IN (
                SELECT \`groupId\` 
                FROM \`Members\` 
                WHERE \`userId\` = ?
            ))
        )
) 
UNION 
(
    SELECT 
        \`Quizzes\`.\`id\` AS \`id\`, 
        NULL AS \`title\`, 
        NULL AS \`medium\`, 
        NULL AS \`url\`, 
        \`Quizzes\`.\`tags\` AS \`tags\`, 
        \`Quizzes\`.\`createdBy\` AS \`createdBy\`, 
        NULL AS \`publishedUpdated\`,  
        NULL AS \`lastAccessed\`, 
        NULL AS \`text\`, 
        \`Quizzes\`.\`type\` AS \`type\`, 
        \`Quizzes\`.\`prompt\` AS \`prompt\`, 
        \`Quizzes\`.\`choices\` AS \`choices\`, 
        \`Quizzes\`.\`correctResponses\` AS \`correctResponses\`, 
        \`Quizzes\`.\`hints\` AS \`hints\`, 
        \`ResourcePermissions\`.\`resourceType\` 
    FROM \`ResourcePermissions\` 
    LEFT JOIN \`Quizzes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Quizzes\`.\`id\` 
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'quiz' 
        AND (
            \`ResourcePermissions\`.\`permitAll\` = 1 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND \`ResourcePermissions\`.\`permittedId\` = ?) 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND \`ResourcePermissions\`.\`permittedId\` IN (
                SELECT \`groupId\` 
                FROM \`Members\` 
                WHERE \`userId\` = ?
            ))
        )
)
`;

    const fieldsArray = [userId, userId, userId, userId, userId, userId];

    try {
        const [results, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        results.forEach((x) => {
            switch (x.resourceType) {
                case "source":
                    resources.sources.push({
                        id: x.id,
                        title: x.title,
                        medium: x.medium,
                        url: x.url,
                        tags: x.tags,
                        createdBy: x.createdBy,
                        publishedUpdated: x.publishedUpdated,
                        lastAccessed: x.lastAccessed,
                    });
                    break;
                case "note":
                    resources.notes.push({
                        id: x.id,
                        title: x.title,
                        text: x.text,
                        tags: x.tags,
                        createdBy: x.createdBy,
                    });
                    break;
                case "quiz":
                    resources.quizzes.push({
                        id: x.id,
                        type: x.type,
                        prompt: x.prompt,
                        choices: x.choices,
                        correctResponses: x.correctResponses,
                        hints: x.hints,
                        tags: x.tags,
                        createdBy: x.createdBy,
                    });
                    break;
                case "course":
                    resources.courses.push({
                        id: x.id,
                        name: x.name,
                        description: x.description,
                        enrollment: x.enrollment,
                        createdBy: x.createdBy,
                        createdDate: x.createdDate,
                    });
            }
        });

        return resources;
    } catch (error) {
        console.error(error);
    }

    return resources;
}

export async function getPermittedSources(userId) {
    let baseQuery = `
    SELECT \`Sources\`.\`id\`, 
           \`Sources\`.\`title\`, 
           \`Sources\`.\`medium\`, 
           \`Sources\`.\`url\`, 
           \`Sources\`.\`tags\`, 
           \`Sources\`.\`createdBy\`, 
           \`Sources\`.\`publishedUpdated\`,
           \`Sources\`.\`lastAccessed\`, 
           \`SourceCredits\`.\`id\` AS \`creditId\`, 
           \`SourceCredits\`.\`name\` AS \`creditName\`,
           \`SourceCredits\`.\`type\` AS \`creditType\`,
           \`CourseResources\`.\`courseId\`,
           \`ResourcePermissions\`.\`id\` AS \`permissionId\`,
           \`ResourcePermissions\`.\`resourceId\`,
           \`ResourcePermissions\`.\`resourceType\`,
           \`ResourcePermissions\`.\`permitAll\`,
           \`ResourcePermissions\`.\`permittedId\`,
           \`ResourcePermissions\`.\`permittedType\`,
           \`ResourcePermissions\`.\`permissionType\`,`;

    if (userId) {
        baseQuery += `           
        \`Members\`.\`userId\`,
        \`Members\`.\`groupId\`
    FROM \`Sources\` 
    LEFT JOIN \`CourseResources\`
        ON \`CourseResources\`.\`resourceId\` = \`Sources\`.\`id\`
        AND \`CourseResources\`.\`resourceType\` = 'source' 
    LEFT JOIN \`SourceCredits\`
        ON \`SourceCredits\`.\`sourceId\` = \`Sources\`.\`id\`
    LEFT JOIN \`ResourcePermissions\`
        ON \`ResourcePermissions\`.\`resourceId\` = \`Sources\`.\`id\`
        AND \`ResourcePermissions\`.\`resourceType\` = 'source'
    LEFT JOIN \`Members\`
        ON \`Members\`.\`userId\` = ?`;
    } else {
        baseQuery += `
        NULL AS \`userId\`,
        NULL AS \`groupId\`
    FROM \`Sources\` 
    LEFT JOIN \`ResourcePermissions\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Sources\`.\`id\`
    LEFT JOIN \`SourceCredits\`
        ON \`SourceCredits\`.\`sourceId\` = \`Sources\`.\`id\`
    LEFT JOIN \`CourseResources\`
        ON \`CourseResources\`.\`resourceId\` = \`Sources\`.\`id\`
        AND \`CourseResources\`.\`resourceType\` = 'source'
    WHERE \`ResourcePermissions\`.\`permitAll\` = 1`;
    }

    const fieldsArray = userId ? [userId, userId, userId] : [];

    try {
        const [sourceResults, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const sources = [];
        sourceResults.forEach((s) => {
            let source = sources.find((x) => x.id === s.id);
            if (!source) {
                source = {
                    id: s.id,
                    title: s.title,
                    medium: s.medium,
                    url: s.url,
                    tags: s.tags,
                    createdBy: s.createdBy,
                    publishedUpdated: s.publishedUpdated,
                    lastAccessed: s.lastAccessed,
                    authors: [],
                    courses: [],
                    permissions: [],
                    permissionType: s.permissionType,
                };
                sources.push(source);
            }
            if (s.creditName && !source.authors.includes(s.creditName)) {
                source.authors.push(s.creditName);
            }
            if (s.courseId && !source.courses.includes(s.courseId)) {
                source.courses.push(s.courseId);
            }
            if (
                s.permissionId &&
                s.resourceId === source.id &&
                s.resourceType === "source" &&
                source.permissions.find((x) => x.id === s.permissionId) ==
                    undefined
            ) {
                const permission = {
                    id: s.permissionId,
                    resourceId: source.id,
                    resourceType: "source",
                    permitAll: s.permitAll,
                    permissionType: s.permissionType,
                    permittedId: s.permittedId,
                    permittedType: s.permittedType,
                };

                source.permissions.push(permission);

                if (source.permissionType === "write") {
                    return;
                }

                if (s.permitAll) {
                    source.permissionType = s.permissionType;
                }
                if (s.permittedType === "user" && s.permittedId === userId) {
                    source.permissionType = s.permissionType;
                }
                if (
                    s.permittedType === "group" &&
                    s.permittedId === s.groupId &&
                    s.userId === userId
                ) {
                    source.permissionType = s.permissionType;
                }
            }
        });

        return sources;
    } catch (error) {
        console.error(error);
    }
}

export async function getPermittedSource(sourceId, userId) {
    const baseQuery = `SELECT \`Sources\`.\`id\`, 
        \`Sources\`.\`title\`, 
        \`Sources\`.\`medium\`, 
        \`Sources\`.\`url\`, 
        \`Sources\`.\`tags\`, 
        \`Sources\`.\`createdBy\`, 
        \`Sources\`.\`publishedUpdated\`, 
        \`Sources\`.\`lastAccessed\`, 
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Sources\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Sources\`.\`id\`
    WHERE 
        (\`ResourcePermissions\`.\`resourceType\` = 'source' AND \`Sources\`.\`id\` = ?)
        AND 
        (\`ResourcePermissions\`.\`permitAll\` = 1 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND
                \`ResourcePermissions\`.\`permittedId\` = ?
            ) 
            OR
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND
                \`ResourcePermissions\`.\`permittedId\` IN (
                    SELECT \`groupId\`
                    FROM \`Members\`
                    WHERE \`userId\` = ?
                )
            )
        )
    `;

    const fieldsArray = [sourceId, userId, userId];

    try {
        const [sources, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        return sources[0];
    } catch (error) {
        console.error(error);
    }
}

export async function getSourcesById({ id, ids, userId }) {
    let baseQuery = `
    SELECT 
      \`Sources\`.\`id\`, 
      \`Sources\`.\`title\`, 
      \`Sources\`.\`medium\`, 
      \`Sources\`.\`url\`, 
      \`Sources\`.\`tags\`, 
      \`Sources\`.\`publishedUpdated\`, 
      \`Sources\`.\`lastAccessed\`, 
      \`SourceCredits\`.\`id\` AS \`creditId\`, 
      \`SourceCredits\`.\`name\` AS \`creditName\`, 
      \`SourceCredits\`.\`type\` AS \`creditType\`, 
      \`Creator\`.\`id\` AS \`creatorId\`, 
      \`Creator\`.\`username\` AS \`creatorName\`, 
      \`Creator\`.\`displayName\` AS \`creatorDisplay\`, 
      \`Creator\`.\`description\` AS \`creatorDesc\`, 
      \`Creator\`.\`avatar\` AS \`creatorAvatar\`, 
      \`Contributors\`.\`id\` AS \`contribId\`, 
      \`Contributors\`.\`username\` AS \`contribName\`, 
      \`Contributors\`.\`displayName\` AS \`contribDisplay\`, 
      \`Contributors\`.\`description\` AS \`contribDesc\`, 
      \`Contributors\`.\`avatar\` AS \`contribAvatar\`, 
      \`CourseResources\`.\`id\` AS \`courseId\``;

    if (userId != undefined) {
        baseQuery += `, 
      \`ResourcePermissions\`.\`permissionType\``;
    }

    baseQuery += `
      FROM \`Sources\``;

    if (userId != undefined) {
        baseQuery += `
      LEFT JOIN \`ResourcePermissions\`
          ON \`ResourcePermissions\`.\`resourceId\` = \`Sources\`.\`id\`
          AND \`ResourcePermissions\`.\`resourceType\` = 'source'`;
    }

    baseQuery += `LEFT JOIN \`SourceCredits\`
        ON \`SourceCredits\`.\`sourceId\` = \`Sources\`.\`id\`
    LEFT JOIN \`Users\` AS \`Creator\` 
        ON \`Creator\`.\`id\` = \`Sources\`.\`createdBy\`
    LEFT JOIN 
      \`ResourceContributors\` 
        ON \`Sources\`.\`id\` = \`ResourceContributors\`.\`resourceId\` 
        AND \`ResourceContributors\`.\`resourceType\` = 'source'
    LEFT JOIN 
      \`Users\` AS \`Contributors\` 
        ON \`ResourceContributors\`.\`userId\` = \`Contributors\`.\`id\`
    LEFT JOIN 
      \`CourseResources\` 
        ON \`Sources\`.\`id\` = \`CourseResources\`.\`resourceId\` 
        AND \`CourseResources\`.\`resourceType\` = 'source'
  `;

    baseQuery +=
        ids && ids.length > 0
            ? `WHERE \`Sources\`.\`id\` IN (?)`
            : `WHERE \`Sources\`.\`id\` = ?`;

    if (userId) {
        baseQuery += `AND (
              \`ResourcePermissions\`.\`permitAll\` = 1 
              OR 
              (\`ResourcePermissions\`.\`permittedType\` = 'user' AND
                  \`ResourcePermissions\`.\`permittedId\` = ?
              ) 
              OR
              (\`ResourcePermissions\`.\`permittedType\` = 'group' AND
                  \`ResourcePermissions\`.\`permittedId\` IN (
                      SELECT \`groupId\`
                      FROM \`Members\`
                      WHERE \`userId\` = ?
                  )
              )
          )`;
    }

    const fieldsArray = ids && ids.length > 0 ? [ids] : [id];
    if (userId) {
        fieldsArray.push(userId, userId);
    }

    try {
        const [results, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const sources = [];
        results.forEach((s) => {
            let source = sources.find((x) => x.id === s.id);
            if (!source) {
                source = {
                    id: s.id,
                    title: s.title,
                    medium: s.medium,
                    url: s.url,
                    tags: s.tags,
                    credits: [],
                    publishedUpdated: s.publishedUpdated,
                    lastAccessed: s.lastAccessed,
                    creator: {},
                    contributors: [],
                    courses: [],
                };
                if (s.permissionType) {
                    source.permissionType = s.permissionType;
                }
                sources.push(source);
            }
            if (
                s.creditId &&
                source.credits.find((x) => x.id === s.creditId) == undefined
            ) {
                source.credits.push({
                    id: s.creditId,
                    name: s.creditName,
                    type: s.creditType,
                });
            }
            if (s.creatorId) {
                source.creator = {
                    id: s.creatorId,
                    username: s.creatorName,
                    displayName: s.creatorDisplay,
                    description: s.creatorDesc,
                    avatar: s.creatorAvatar,
                };
            }
            if (s.contribId) {
                source.contributors.push({
                    id: s.contribId,
                    username: s.contribName,
                    displayName: s.contribDisplay,
                    description: s.contribDesc,
                    avatar: s.contribAvatar,
                });
            }
            if (s.courseId && !source.courses.includes(q.courseId)) {
                source.courses.push(q.courseId);
            }
        });

        return sources;
    } catch (error) {
        console.error(error);
    }
}

export async function updateSource(source) {
    const {
        id,
        title,
        medium,
        url,
        tags,
        publishedUpdated,
        lastAccessed,
        authors,
        courses,
        permissions,
        contributorId,
    } = source;

    const allowedMedia = [
        "book",
        "article",
        "video",
        "podcast",
        "website",
        "audio",
    ];

    try {
        const setSource = {};
        if (title) {
            setSource.title = title;
        }
        if (medium && allowedMedia.includes(medium)) {
            setSource.medium = medium;
        }
        if (url) {
            setSource.url = url;
        }
        if (tags) {
            setSource.tags = JSON.stringify(tags);
        }
        if (publishedUpdated) {
            setSource.publishedUpdated = sqlDate(publishedUpdated);
        }
        if (lastAccessed) {
            setSource.lastAccessed = sqlDate(lastAccessed);
        }

        const setClause = Object.keys(setSource)
            .map((key) => `${key} = ?`)
            .join(", ");

        const setValues = Object.values(setSource);
        setValues.push(id);

        const query = `UPDATE \`Sources\` SET ${setClause} WHERE \`id\` = ?`;

        const [sourceResults, sFields] = await db
            .promise()
            .query(query, setValues);

        if (contributorId) {
            const [contribInsert, contribFields] = await db
                .promise()
                .query(
                    "INSERT INTO `ResourceContributors` (`resourceId`, `resourceType`, `userId`) VALUES (?, 'source', ?)",
                    [id, contributorId],
                );
        }

        const promises = [];

        if (authors && authors.length > 0) {
            const credits = [];
            const values = [];
            authors.forEach((auth) => {
                credits.push(`(?, ?, 'Author')`);
                values.push(id, auth);
            });
            promises.push(
                db
                    .promise()
                    .query(
                        `INSERT IGNORE INTO \`SourceCredits\` (\`sourceId\`, \`name\`, \`type\`) VALUES ${credits.join(
                            ", ",
                        )}`,
                        values,
                    ),
            );
        }

        if (courses && courses.length > 0) {
            courses.forEach((crs) => {
                promises.push(
                    upsertTable(
                        `Course`,
                        {
                            courseId: crs,
                            resourceId: id,
                            resourceType: "source",
                            includeReferencingResources:
                                crs.includeReferencingResources,
                        },
                        [`includeReferencingResources`],
                    ),
                );
            });
        }
        if (permissions) {
            console.log("HERE ARE THE PERMISSIONS WE HAVE", permissions);
            promises.push(updatePermissions(permissions));
        }

        await Promise.all(promises);

        return sourceResults;
    } catch (error) {
        console.error("Error in updateSource", error);
        throw error;
    }
}

export async function getPermittedNotes(userId) {
    const baseQuery = userId
        ? `SELECT \`Notes\`.\`id\`, 
        \`Notes\`.\`title\`, 
        \`Notes\`.\`text\`, 
        \`Notes\`.\`tags\`, 
        \`Notes\`.\`createdBy\`,
        \`ResourceSources\`.\`sourceId\`,
        \`CourseResources\`.\`courseId\`, 
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Notes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Notes\`.\`id\` 
    LEFT JOIN \`ResourceSources\`
        ON \`ResourceSources\`.\`resourceId\` = \`Notes\`.\`id\`
        AND \`ResourceSources\`.\`resourceType\` = 'note'
    LEFT JOIN \`CourseResources\`
        ON \`CourseResources\`.\`resourceId\` = \`Notes\`.\`id\`
        AND \`CourseResources\`.\`resourceType\` = 'note'
    WHERE 
        \`ResourcePermissions\`.\`resourceType\` = 'note'
        AND (
            \`ResourcePermissions\`.\`permitAll\` = 1 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND
                \`ResourcePermissions\`.\`permittedId\` = ?
            ) 
            OR
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND
                \`ResourcePermissions\`.\`permittedId\` IN (
                    SELECT \`groupId\`
                    FROM \`Members\`
                    WHERE \`userId\` = ?
                )
            )
        )
    `
        : `SELECT \`Notes\`.\`id\`, 
        \`Notes\`.\`title\`, 
        \`Notes\`.\`text\`, 
        \`Notes\`.\`tags\`, 
        \`Notes\`.\`createdBy\`,
        \`ResourceSources\`.\`sourceId\`,
        \`CourseResources\`.\`courseId\`, 
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Notes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Notes\`.\`id\` 
    LEFT JOIN \`ResourceSources\`
        ON \`ResourceSources\`.\`resourceId\` = \`Notes\`.\`id\`
        AND \`ResourceSources\`.\`resourceType\` = 'note'
    LEFT JOIN \`CourseResources\`
        ON \`CourseResources\`.\`resourceId\` = \`Notes\`.\`id\`
        AND \`CourseResources\`.\`resourceType\` = 'note'
    WHERE 
        \`ResourcePermissions\`.\`resourceType\` = 'note'
        AND \`ResourcePermissions\`.\`permitAll\` = 1 
    `;

    const fieldsArray = userId ? [userId, userId] : [];

    try {
        const [noteResults, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const notes = [];
        noteResults.forEach((n) => {
            let note = notes.find((x) => x.id === n.id);
            if (!note) {
                note = {
                    id: n.id,
                    title: n.title,
                    text: n.text,
                    tags: n.tags,
                    createdBy: n.createdBy,
                    sources: [],
                    courses: [],
                    permissionType: n.permissionType,
                };
                notes.push(note);
            }
            if (n.sourceId && !note.sources.includes(n.sourceId)) {
                note.sources.push(n.sourceId);
            }
            if (n.courseId && !note.courses.includes(n.courseId)) {
                note.courses.push(n.courseId);
            }
        });
        return notes;
    } catch (error) {
        console.error(error);
    }
}

export async function getPermittedNote(noteId, userId) {
    const baseQuery = `SELECT \`Notes\`.\`id\`, 
        \`Notes\`.\`title\`, 
        \`Notes\`.\`text\`, 
        \`Notes\`.\`tags\`, 
        \`Notes\`.\`createdBy\`,
        \`ResourceSources\`.\`sourceId\`,
        \`CourseResources\`.\`courseId\`, 
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Notes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Notes\`.\`id\`
    LEFT JOIN \`ResourceSources\`
        ON \`ResourceSources\`.\`resourceId\` = \`Notes\`.\`id\`
    LEFT JOIN \`CourseResources\`
        ON \`CourseResources\`.\`resourceId\` = \`Notes\`.\`id\`
    WHERE 
        \`Notes\`.\`id\` = ?
        AND
            \`ResourcePermissions\`.\`resourceType\` = 'note'
        AND
            \`ResourceSources\`.\`resourceType\` = 'note'
        AND
            \`CourseResources\`.\`resourceType\` = 'note'
        AND
        (\`ResourcePermissions\`.\`permitAll\` = 1 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND
                \`ResourcePermissions\`.\`permittedId\` = ?
            ) 
            OR
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND
                \`ResourcePermissions\`.\`permittedId\` IN (
                    SELECT \`groupId\`
                    FROM \`Members\`
                    WHERE \`userId\` = ?
                )
            )
        )
    `;

    const fieldsArray = [noteId, userId, userId];

    try {
        const [notes, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const note = {
            id: notes[0].id,
            title: notes[0].title,
            text: notes[0].text,
            tags: notes[0].tags,
            createdBy: notes[0].createdBy,
            sources: [],
            courses: [],
            permissionType: notes[0].permissionType,
        };
        notes.forEach((n) => {
            if (n.sourceId && !note.sources.includes(n.sourceId)) {
                note.sources.push(n.sourceId);
            }
            if (n.courseId && !note.courses.includes(n.courseId)) {
                note.courses.push(n.courseId);
            }
        });
        return note;
    } catch (error) {
        console.error(error);
    }
}

export async function getNotesById({ id, ids, userId }) {
    let baseQuery = `
    SELECT 
      \`Notes\`.\`id\`, 
      \`Notes\`.\`title\`, 
      \`Notes\`.\`text\`, 
      \`Notes\`.\`tags\`, 
      \`ResourceSources\`.\`sourceId\`, 
      \`ResourceSources\`.\`locInSource\`, 
      \`ResourceSources\`.\`locType\`, 
      \`Creator\`.\`id\` AS \`creatorId\`, 
      \`Creator\`.\`username\` AS \`creatorName\`, 
      \`Creator\`.\`displayName\` AS \`creatorDisplay\`, 
      \`Creator\`.\`description\` AS \`creatorDesc\`, 
      \`Creator\`.\`avatar\` AS \`creatorAvatar\`, 
      \`Contributors\`.\`id\` AS \`contribId\`, 
      \`Contributors\`.\`username\` AS \`contribName\`, 
      \`Contributors\`.\`displayName\` AS \`contribDisplay\`, 
      \`Contributors\`.\`description\` AS \`contribDesc\`, 
      \`Contributors\`.\`avatar\` AS \`contribAvatar\`, 
      \`CourseResources\`.\`id\` AS \`courseId\``;

    if (userId != undefined) {
        baseQuery += `, 
      \`ResourcePermissions\`.\`permissionType\``;
    }

    baseQuery += `
      FROM \`Notes\``;

    if (userId != undefined) {
        baseQuery += `
      LEFT JOIN \`ResourcePermissions\`
          ON \`ResourcePermissions\`.\`resourceId\` = \`Notes\`.\`id\`
          AND \`ResourcePermissions\`.\`resourceType\` = 'note'`;
    }

    baseQuery += `LEFT JOIN
      \`ResourceSources\` 
      ON \`ResourceSources\`.\`resourceId\` = \`Notes\`.\`id\`
      AND \`ResourceSources\`.\`resourceType\` = 'note'
    LEFT JOIN 
      \`Users\` AS \`Creator\` 
        ON \`Creator\`.\`id\` = \`Notes\`.\`createdBy\`
    LEFT JOIN 
      \`ResourceContributors\` 
        ON \`Notes\`.\`id\` = \`ResourceContributors\`.\`resourceId\` 
        AND \`ResourceContributors\`.\`resourceType\` = 'note'
    LEFT JOIN 
      \`Users\` AS \`Contributors\` 
        ON \`ResourceContributors\`.\`userId\` = \`Contributors\`.\`id\`
    LEFT JOIN 
      \`CourseResources\` 
        ON \`Notes\`.\`id\` = \`CourseResources\`.\`resourceId\` 
        AND \`CourseResources\`.\`resourceType\` = 'note'
  `;

    baseQuery +=
        ids && ids.length > 0
            ? `WHERE \`Notes\`.\`id\` IN (?)`
            : `WHERE \`Notes\`.\`id\` = ?`;

    if (userId) {
        baseQuery += `AND (
              \`ResourcePermissions\`.\`permitAll\` = 1 
              OR 
              (\`ResourcePermissions\`.\`permittedType\` = 'user' AND
                  \`ResourcePermissions\`.\`permittedId\` = ?
              ) 
              OR
              (\`ResourcePermissions\`.\`permittedType\` = 'group' AND
                  \`ResourcePermissions\`.\`permittedId\` IN (
                      SELECT \`groupId\`
                      FROM \`Members\`
                      WHERE \`userId\` = ?
                  )
              )
          )`;
    }

    const fieldsArray = ids && ids.length > 0 ? [ids] : [id];
    if (userId) {
        fieldsArray.push(userId, userId);
    }

    try {
        const [results, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const notes = [];
        results.forEach((n) => {
            let note = notes.find((x) => x.id === n.id);
            if (!note) {
                note = {
                    id: n.id,
                    title: n.title,
                    text: n.text,
                    tags: n.tags,
                    creator: {},
                    contributors: [],
                    sources: [],
                    courses: [],
                };
                if (n.permissionType) {
                    note.permissionType = n.permissionType;
                }
                notes.push(note);
            }
            if (n.noteId && !note.notes.includes(n.noteId)) {
                note.notes.push(n.noteId);
            }
            if (
                n.sourceId &&
                note.sources.find((x) => x.id === n.sourceId) == undefined
            ) {
                note.sources.push({
                    id: n.sourceId,
                    locInSource: n.locInSource,
                    locType: n.locType,
                });
            }
            if (n.creatorId) {
                note.creator = {
                    id: n.creatorId,
                    username: n.creatorName,
                    displayName: n.creatorDisplay,
                    description: n.creatorDesc,
                    avatar: n.creatorAvatar,
                };
            }
            if (n.contribId) {
                note.contributors.push({
                    id: n.contribId,
                    username: n.contribName,
                    displayName: n.contribDisplay,
                    description: n.contribDesc,
                    avatar: n.contribAvatar,
                });
            }
            if (n.courseId && !note.courses.includes(n.courseId)) {
                note.courses.push(n.courseId);
            }
        });

        return notes;
    } catch (error) {
        console.error(error);
    }
}

export async function updateNote(note) {
    const {
        id,
        title,
        text,
        tags,
        sources,
        courses,
        permissions,
        contributorId,
    } = note;

    try {
        const setNote = {};
        if (title) {
            setNote.title = title;
        }
        if (text) {
            setNote.text = text;
        }
        if (tags) {
            setNote.tags = JSON.stringify(tags);
        }

        const setClause = Object.keys(setNote)
            .map((key) => `${key} = ?`)
            .join(", ");

        const setValues = Object.values(setNote);
        setValues.push(id);

        const query = `UPDATE \`Notes\` SET ${setClause} WHERE \`id\` = ?`;

        const [noteResults, nFields] = await db
            .promise()
            .query(query, setValues);

        if (contributorId) {
            const [contribInsert, contribFields] = await db
                .promise()
                .query(
                    "INSERT INTO `ResourceContributors` (`resourceId`, `resourceType`, `userId`) VALUES (?, 'note', ?)",
                    [id, contributorId],
                );
        }

        const promises = [];

        if (sources && sources.length > 0) {
            sources.forEach((src) => {
                promises.push(
                    upsertTable(`ResourceSources`, src, [
                        `sourceId`,
                        `locInSource`,
                        `locType`,
                    ]),
                );
            });
        }
        if (courses && courses.length > 0) {
            courses.forEach((crs) => {
                promises.push(
                    upsertTable(
                        `Course`,
                        {
                            courseId: crs,
                            resourceId: id,
                            resourceType: "note",
                            includeReferencingResources:
                                crs.includeReferencingResources,
                        },
                        [`includeReferencingResources`],
                    ),
                );
            });
        }
        if (permissions) {
            updatePermissions(permissions);
        }

        await Promise.all(promises);

        return noteResults;
    } catch (error) {
        console.error("Error in updateNote", error);
        throw error;
    }
}

export async function upsertTable(tableName, data, updateColumns) {
    try {
        const columnNames = Object.keys(data).join(", ");
        const questionMarks = Object.keys(data)
            .map(() => "?")
            .join(", ");

        const updateClause = updateColumns
            .map((key) => `${key} = VALUES(${key})`)
            .join(", ");

        const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${questionMarks}) ON DUPLICATE KEY UPDATE ${updateClause}`;

        const values = Object.values(data);

        const [results, fields] = await db.promise().query(query, values);

        return results;
    } catch (error) {
        console.error(`ERROR ON UPSERT FOR ${tableName}`, error);
    }
}

export async function getPermittedQuizzes(userId) {
    let baseQuery = `
    SELECT 
        \`Quizzes\`.\`id\`, 
        \`Quizzes\`.\`type\`, 
        \`Quizzes\`.\`prompt\`, 
        \`Quizzes\`.\`choices\`,  
        \`Quizzes\`.\`correctResponses\`,   
        \`Quizzes\`.\`hints\`, 
        \`Quizzes\`.\`tags\`, 
        \`Quizzes\`.\`createdBy\`,
        \`CourseResources\`.\`courseId\`,
        \`QuizNotes\`.\`noteId\`,
        \`ResourceSources\`.\`sourceId\`, 
        \`ResourceSources\`.\`locInSource\`, 
        \`ResourceSources\`.\`locType\`,
        \`ResourcePermissions\`.\`id\` AS \`permissionId\`,
        \`ResourcePermissions\`.\`resourceId\`,
        \`ResourcePermissions\`.\`resourceType\`,
        \`ResourcePermissions\`.\`permitAll\`,
        \`ResourcePermissions\`.\`permittedId\`,
        \`ResourcePermissions\`.\`permittedType\`,
        \`ResourcePermissions\`.\`permissionType\`,
`;

    if (userId) {
        baseQuery += `
        \`Members\`.\`userId\`,
        \`Members\`.\`groupId\`
    FROM \`Quizzes\`
    LEFT JOIN \`CourseResources\`
        ON \`Quizzes\`.\`id\` = \`CourseResources\`.\`resourceId\` 
        AND \`CourseResources\`.\`resourceType\` = 'quiz'
    LEFT JOIN \`QuizNotes\`
        ON \`QuizNotes\`.\`quizId\` = \`Quizzes\`.\`id\`
    LEFT JOIN \`ResourceSources\`
        ON \`ResourceSources\`.\`resourceId\` = \`Quizzes\`.\`id\`
        AND \`ResourceSources\`.\`resourceType\` = 'quiz'
    LEFT JOIN \`ResourcePermissions\` 
        ON \`ResourcePermissions\`.\`resourceType\` = 'quiz'
    LEFT JOIN \`Members\`
        ON \`Members\`.\`userId\` = ?`;
    } else {
        baseQuery += `
        NULL AS \`userId\`,
        NULL AS \`groupId\`
    FROM \`Quizzes\` 
    LEFT JOIN \`ResourcePermissions\`
        ON \`ResourcePermissions\`.\`resourceId\` = \`Quizzes\`.\`id\`
        AND \`ResourcePermissions\`.\`resourceType\` = 'quiz'
    LEFT JOIN \`CourseResources\`
        ON \`Quizzes\`.\`id\` = \`CourseResources\`.\`resourceId\` 
        AND \`CourseResources\`.\`resourceType\` = 'quiz'
    LEFT JOIN \`ResourceSources\`
        ON \`ResourceSources\`.\`resourceId\` = \`Quizzes\`.\`id\`
        AND \`ResourceSources\`.\`resourceType\` = 'quiz'
    LEFT JOIN \`QuizNotes\`
        ON \`QuizNotes\`.\`quizId\` = \`Quizzes\`.\`id\`
    WHERE \`ResourcePermissions\`.\`permitAll\` = 1`;
    }

    const fieldsArray = userId ? [userId] : [];

    try {
        const [quizResults, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const quizzes = [];
        quizResults.forEach((q) => {
            let quiz = quizzes.find((x) => x.id === q.id);
            if (!quiz) {
                quiz = {
                    id: q.id,
                    type: q.type,
                    prompt: q.prompt,
                    choices: q.choices,
                    correctResponses: q.correctResponses,
                    hints: q.hints,
                    tags: q.tags,
                    createdBy: q.createdBy,
                    courses: [],
                    notes: [],
                    sources: [],
                    permissions: [],
                    permissionType: undefined,
                };
                quizzes.push(quiz);
            }
            if (q.courseId && !quiz.courses.includes(q.courseId)) {
                quiz.courses.push(q.courseId);
            }
            if (q.noteId && !quiz.notes.includes(q.noteId)) {
                quiz.notes.push(q.noteId);
            }
            if (
                q.sourceId &&
                quiz.sources.find((x) => x.id === q.sourceId) == undefined
            ) {
                quiz.sources.push({
                    id: q.sourceId,
                    locInSource: q.locInSource,
                    locType: q.locType,
                });
            }
            if (
                q.permissionId &&
                q.resourceId === quiz.id &&
                q.resourceType === "quiz" &&
                quiz.permissions.find((x) => x.id === q.permissionId) ==
                    undefined
            ) {
                const permission = {
                    id: q.permissionId,
                    resourceId: quiz.id,
                    resourceType: "quiz",
                    permitAll: q.permitAll,
                    permissionType: q.permissionType,
                    permittedId: q.permittedId,
                    permittedType: q.permittedType,
                };

                quiz.permissions.push(permission);

                if (quiz.permissionType === "write") {
                    return;
                }

                if (q.permitAll) {
                    quiz.permissionType = q.permissionType;
                }
                if (q.permittedType === "user" && q.permittedId === userId) {
                    quiz.permissionType = q.permissionType;
                }
                if (
                    q.permittedType === "group" &&
                    q.permittedId === q.groupId &&
                    q.userId === userId
                ) {
                    quiz.permissionType = q.permissionType;
                }
            }
        });

        return quizzes;
    } catch (error) {
        console.error(error);
    }
}

export async function getUserQuizzes(userId) {
    const baseQuery = "SELECT * FROM `UserQuizzes` WHERE `userId` = ?";

    try {
        const [results, fields] = await db.promise().query(baseQuery, [userId]);

        return results;
    } catch (error) {
        console.error(error);
    }
}

export async function updateQuiz(quiz) {
    const allowedTypes = [
        "prompt-response",
        "multiple-choice",
        "unordered-list-answer",
        "ordered-list-answer",
        "fill-in-the-blank",
        "verbatim",
    ];

    const {
        id,
        type,
        prompt,
        choices,
        correctResponses,
        hints,
        tags,
        sources,
        notes,
        courses,
        permissions,
        contributorId,
    } = quiz;

    try {
        const setQuiz = {};
        if (type && allowedTypes.includes(type)) {
            setQuiz.type = type;
        }
        if (prompt) {
            setQuiz.prompt = prompt.trim();
        }
        if (choices) {
            setQuiz.choices = JSON.stringify(choices);
        }
        if (correctResponses) {
            setQuiz.correctResponses = JSON.stringify(correctResponses);
        }
        if (hints) {
            setQuiz.hints = JSON.stringify(hints);
        }
        if (tags) {
            setQuiz.tags = JSON.stringify(tags);
        }

        const setClause = Object.keys(setQuiz)
            .map((key) => `${key} = ?`)
            .join(", ");

        const setValues = Object.values(setQuiz);
        setValues.push(id);

        const query = `UPDATE \`Quizzes\` SET ${setClause} WHERE \`id\` = ?`;

        const [quizResults, qFields] = await db
            .promise()
            .query(query, setValues);

        if (contributorId) {
            const [contribInsert, contribFields] = await db
                .promise()
                .query(
                    "INSERT INTO `ResourceContributors` (`resourceId`, `resourceType`, `userId`) VALUES (?, 'quiz', ?)",
                    [id, contributorId],
                );
        }

        const promises = [];

        if (sources && sources.length > 0) {
            sources.forEach((src) => {
                promises.push(
                    upsertTable("`ResourceSources`", src, [
                        `sourceId`,
                        `locInSource`,
                        `locType`,
                    ]),
                );
            });
        }
        if (courses && courses.length > 0) {
            courses.forEach((crs) => {
                promises.push(
                    upsertTable(
                        `CourseResources`,
                        {
                            courseId: crs,
                            resourceId: id,
                            resourceType: "quiz",
                        },
                        [`includeReferencingResources`],
                    ),
                );
            });
        }
        if (notes && notes.length > 0) {
            notes.forEach((nt) => {
                promises.push(
                    db
                        .promise()
                        .query(
                            "INSERT IGNORE INTO `QuizNotes` (`quizId`, `noteId`) VALUES (?, ?)",
                            [id, nt],
                        ),
                );
            });
        }
        if (permissions) {
            updatePermissions(permissions);
        }

        await Promise.all(promises);

        return quizResults;
    } catch (error) {
        console.error("Error in updateQuiz", error);
        throw error;
    }
}

export async function getQuizzesById({ id, ids, userId }) {
    let baseQuery = `
  SELECT 
    \`Quizzes\`.\`id\`, 
    \`Quizzes\`.\`type\`, 
    \`Quizzes\`.\`prompt\`, 
    \`Quizzes\`.\`choices\`, 
    \`Quizzes\`.\`correctResponses\`, 
    \`Quizzes\`.\`hints\`, 
    \`Quizzes\`.\`tags\`, 
    \`QuizNotes\`.\`noteId\`, 
    \`ResourceSources\`.\`sourceId\`, 
    \`ResourceSources\`.\`locInSource\`, 
    \`ResourceSources\`.\`locType\`, 
    \`Creator\`.\`id\` AS \`creatorId\`, 
    \`Creator\`.\`username\` AS \`creatorName\`, 
    \`Creator\`.\`displayName\` AS \`creatorDisplay\`, 
    \`Creator\`.\`description\` AS \`creatorDesc\`, 
    \`Creator\`.\`avatar\` AS \`creatorAvatar\`, 
    \`Contributors\`.\`id\` AS \`contribId\`, 
    \`Contributors\`.\`username\` AS \`contribName\`, 
    \`Contributors\`.\`displayName\` AS \`contribDisplay\`, 
    \`Contributors\`.\`description\` AS \`contribDesc\`, 
    \`Contributors\`.\`avatar\` AS \`contribAvatar\`, 
    \`CourseResources\`.\`id\` AS \`courseId\``;

    if (userId != undefined) {
        baseQuery += `, 
    \`ResourcePermissions\`.\`permissionType\``;
    }

    baseQuery += `
    FROM \`Quizzes\``;

    if (userId != undefined) {
        baseQuery += `
    LEFT JOIN \`ResourcePermissions\`
        ON \`ResourcePermissions\`.\`resourceId\` = \`Quizzes\`.\`id\`
        AND \`ResourcePermissions\`.\`resourceType\` = 'quiz'`;
    }

    baseQuery += `LEFT JOIN
    \`QuizNotes\` ON \`QuizNotes\`.\`quizId\` = \`Quizzes\`.\`id\`
  LEFT JOIN
    \`ResourceSources\` 
    ON \`ResourceSources\`.\`resourceId\` = \`Quizzes\`.\`id\`
    AND \`ResourceSources\`.\`resourceType\` = 'quiz'
  LEFT JOIN 
    \`Users\` AS \`Creator\` 
      ON \`Creator\`.\`id\` = \`Quizzes\`.\`createdBy\`
  LEFT JOIN 
    \`ResourceContributors\` 
      ON \`Quizzes\`.\`id\` = \`ResourceContributors\`.\`resourceId\` 
      AND \`ResourceContributors\`.\`resourceType\` = 'quiz'
  LEFT JOIN 
    \`Users\` AS \`Contributors\` 
      ON \`ResourceContributors\`.\`userId\` = \`Contributors\`.\`id\`
  LEFT JOIN 
    \`CourseResources\` 
      ON \`Quizzes\`.\`id\` = \`CourseResources\`.\`resourceId\` 
      AND \`CourseResources\`.\`resourceType\` = 'quiz'
`;

    baseQuery +=
        ids && ids.length > 0
            ? `WHERE \`Quizzes\`.\`id\` IN (?)`
            : `WHERE \`Quizzes\`.\`id\` = ?`;

    if (userId) {
        baseQuery += `AND (
            \`ResourcePermissions\`.\`permitAll\` = 1 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND
                \`ResourcePermissions\`.\`permittedId\` = ?
            ) 
            OR
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND
                \`ResourcePermissions\`.\`permittedId\` IN (
                    SELECT \`groupId\`
                    FROM \`Members\`
                    WHERE \`userId\` = ?
                )
            )
        )`;
    }

    const fieldsArray = ids && ids.length > 0 ? [ids] : [id];
    if (userId) {
        fieldsArray.push(userId, userId);
    }

    try {
        const [results, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const quizzes = [];
        results.forEach((q) => {
            let quiz = quizzes.find((x) => x.id === q.id);
            if (!quiz) {
                quiz = {
                    id: q.id,
                    type: q.type,
                    prompt: q.prompt,
                    choices: q.choices,
                    correctResponses: q.correctResponses,
                    hints: q.hints,
                    tags: q.tags,
                    creator: {},
                    contributors: [],
                    sources: [],
                    notes: [],
                    courses: [],
                };
                if (q.permissionType) {
                    quiz.permissionType = q.permissionType;
                }
                quizzes.push(quiz);
            }
            if (q.noteId && !quiz.notes.includes(q.noteId)) {
                quiz.notes.push(q.noteId);
            }
            if (
                q.sourceId &&
                quiz.sources.find((x) => x.id === q.sourceId) == undefined
            ) {
                quiz.sources.push({
                    id: q.sourceId,
                    locInSource: q.locInSource,
                    locType: q.locType,
                });
            }
            if (q.creatorId) {
                quiz.creator = {
                    id: q.creatorId,
                    username: q.creatorName,
                    displayName: q.creatorDisplay,
                    description: q.creatorDesc,
                    avatar: q.creatorAvatar,
                };
            }
            if (q.contribId) {
                quiz.contributors.push({
                    id: q.contribId,
                    username: q.contribName,
                    displayName: q.contribDisplay,
                    description: q.contribDesc,
                    avatar: q.contribAvatar,
                });
            }
            if (q.courseId && !quiz.courses.includes(q.courseId)) {
                quiz.courses.push(q.courseId);
            }
        });

        return quizzes;
    } catch (error) {
        console.error(error);
    }
}

export async function getPermittedCourses(userId) {
    const baseQuery = `SELECT \`Courses\`.\`id\`, 
        \`Courses\`.\`name\`, 
        \`Courses\`.\`description\`, 
        \`Courses\`.\`enrollment\`,  
        \`Courses\`.\`createdBy\`,  
        \`Courses\`.\`createdDate\`, 
        \`CourseUsers\`.\`userType\`, 
        \`CourseUsers\`.\`enrollmentExpiration\`, 
        \`CourseHierarchy\`.\`superiorCourse\`, 
        \`CourseHierarchy\`.\`relationship\`, 
        \`CourseHierarchy\`.\`averageLevelRequired\`, 
        \`Superior\`.\`name\` AS \`superiorName\`,
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\` 
    LEFT JOIN \`Courses\`
        ON \`ResourcePermissions\`.\`resourceId\` = \`Courses\`.\`id\` 
    LEFT JOIN \`CourseUsers\` 
        ON \`Courses\`.\`id\` = \`CourseUsers\`.\`courseId\` AND
        \`CourseUsers\`.\`userId\` = ? 
    LEFT JOIN \`CourseHierarchy\` 
        ON \`CourseHierarchy\`.\`inferiorCourse\` = \`Courses\`.\`id\` 
    LEFT JOIN \`Courses\` AS \`Superior\` 
        ON \`CourseHierarchy\`.\`superiorCourse\` = \`Superior\`.\`id\`
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'course' 
        AND (\`ResourcePermissions\`.\`permitAll\` = 1 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND
                \`ResourcePermissions\`.\`permittedId\` = ?
            ) 
            OR
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND
                \`ResourcePermissions\`.\`permittedId\` IN (
                    SELECT \`groupId\`
                    FROM \`Members\`
                    WHERE \`userId\` = ?
                )
            )        
        )
    `;

    const fieldsArray = [userId, userId, userId];

    try {
        const [courseResults, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const courses = [];
        courseResults.forEach((crs) => {
            let course = courses.find((c) => c.id === crs.id);
            if (!course) {
                course = {
                    id: crs.id,
                    name: crs.name,
                    description: crs.description,
                    createdBy: crs.createdBy,
                    createdDate: crs.createdDate,
                    userType: crs.userType,
                    enrollmentExpiration: crs.enrollmentExpiration,
                    parentCourses: [],
                    prerequisites: [],
                };
                courses.push(course);
            }
            if (crs.superiorCourse) {
                if (crs.relationship === "encompasses") {
                    course.parentCourses.push({
                        id: crs.superiorCourse,
                        name: crs.superiorName,
                    });
                }
                if (crs.relationship === "prerequisite") {
                    course.prerequisites.push({
                        course: {
                            id: crs.superiorCourse,
                            name: crs.superiorName,
                        },
                        averageLevelRequired: crs.averageLevelRequired,
                    });
                }
            }
        });

        return courses;
    } catch (error) {
        console.error(error);
    }
}

export async function getEnrolledCourses(userId) {}

export async function getUserGroups(userId) {
    const baseQuery = `SELECT \`Groups\`.\`id\`, 
        \`Groups\`.\`name\`, 
        \`Groups\`.\`description\`, 
        \`Groups\`.\`isPublic\`,
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`Members\`
    LEFT JOIN \`Groups\` ON \`Members\`.\`groupId\` = \`Groups\`.\`id\`
    WHERE \`Members\`.\`userId\` = ? 
    `;

    try {
        const [groups, fields] = await db.promise().query(baseQuery, [userId]);
        return groups;
    } catch (error) {
        console.error(error);
    }
}

export async function insertPermissions(permissions, resourceId, permittedId) {
    if (!permissions) {
        throw Error(
            "A permissions object is required in order to use insertPermissions",
        );
    }

    const permsQuery = `INSERT INTO \`ResourcePermissions\` (resourceId, resourceType, permitAll, permissionType, permittedId, permittedType) VALUES ?`;

    const permInsertValues = [];

    try {
        permissions.forEach((perm) => {
            permInsertValues.push([
                resourceId ? resourceId : perm.resourceId,
                perm.resourceType,
                perm.permitAll ? true : false,
                perm.permissionType,
                perm.permittedId == null ? permittedId : perm.permittedId,
                perm.permittedType,
            ]);
        });

        const [permsInsert, fields] = await db
            .promise()
            .query(permsQuery, [permInsertValues]);

        return permsInsert;
    } catch (error) {
        console.error("ERROR IN insertPermissions\n", error);
    }
}

export async function updatePermissions(permissions) {
    try {
        const promises = [];

        if (!permissions || permissions.length === 0) {
            return;
        }

        permissions.forEach((perm) => {
            promises.push(
                upsertTable(`ResourcePermissions`, perm, [
                    `permitAll`,
                    `permissionType`,
                ]),
            );
        });

        await Promise.all(promises);
    } catch (error) {
        console.error("Error in updatePermissions", error);
        throw error;
    }
}

export async function updateCourseResources() {}

export async function resourceContribution() {}

export async function insertSourceCredits() {}

export async function updateSourceCredits() {}

export async function getPermittedGroups(userId) {
    // Not yet working.
    // Need to provide group permitted by user id
    const baseQuery =
        "SELECT `Groups`.`id`, `Groups`.`name`, `Groups`.`description` as `groupDesc`, `Groups`.`isPublic`, `Groups`.`avatar` AS `groupAvatar`, `Users`.`id` AS `userId`, `Users`.`username`, `Users`.`displayName`, `Users`.`description` AS `userDesc`, `Users`.`avatar` AS `userAvatar`, `Members`.`role` FROM `Groups` LEFT JOIN `Members` ON `Members`.`groupId` = `Groups`.`id` LEFT JOIN `Users` ON `Users`.`id` = `Members`.`userId` WHERE `Groups`.`isPublic` = 0";

    try {
        const [groupResults, fields] = await db.promise().query(baseQuery, []);

        const groups = [];
        groupResults.forEach((g) => {
            let group = groups.find((x) => x.id === g.id);
            if (!group) {
                group = {
                    id: g.id,
                    name: g.name,
                    publicId: g.publicId,
                    description: g.groupDesc,
                    isPublic: g.isPublic,
                    avatar: g.groupAvatar,
                    members: [],
                };
                groups.push(group);
            }
            if (g.userId) {
                group.members.push({
                    id: userId,
                    username: g.username,
                    displayName: g.displayName,
                    description: g.userDesc,
                    avatar: g.userAvatar,
                    role: g.role,
                });
            }
        });

        return groups;
    } catch (error) {
        console.error(error);
    }
}

export async function getGroup({ id, userId }) {
    const baseQuery =
        "SELECT `Groups`.`id`, `Groups`.`name`, `Groups`.`description` as `groupDesc`, `Groups`.`isPublic`, `Groups`.`avatar` AS `groupAvatar`, `Users`.`id` AS `userId`, `Users`.`username`, `Users`.`displayName`, `Users`.`description` AS `userDesc`, `Users`.`avatar` AS `userAvatar`, `Members`.`role` FROM `Groups` LEFT JOIN `Members` ON `Members`.`groupId` = `Groups`.`id` LEFT JOIN `Users` ON `Users`.`id` = `Members`.`userId` WHERE `Groups`.`id` = ?";

    try {
        const [groupResults, fields] = await db
            .promise()
            .query(baseQuery, [id]);

        if (groupResults.length === 0) {
            return undefined;
        }

        const group = {
            id: groupResults[0].id,
            name: groupResults[0].name,
            publicId: groupResults[0].publicId,
            description: groupResults[0].groupDesc,
            isPublic: groupResults[0].isPublic,
            avatar: groupResults[0].groupAvatar,
            members: [],
        };

        groupResults.forEach((g) => {
            if (g.userId) {
                group.members.push({
                    id: g.userId,
                    username: g.username,
                    displayName: g.displayName,
                    description: g.userDesc,
                    avatar: g.userAvatar,
                    role: g.role,
                });
            }
        });

        return group;
    } catch (error) {
        console.error(error);
    }
}
