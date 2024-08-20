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
    const baseQuery = userId
        ? `SELECT \`Sources\`.\`id\`, 
        \`Sources\`.\`title\`, 
        \`Sources\`.\`medium\`, 
        \`Sources\`.\`url\`, 
        \`Sources\`.\`tags\`, 
        \`Sources\`.\`createdBy\`, 
        \`Sources\`.\`publishedUpdated\`,
        \`Sources\`.\`lastAccessed\`, 
        \`CourseResources\`.\`courseId\`, 
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Sources\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Sources\`.\`id\`
    LEFT JOIN \`CourseResources\`
        ON \`CourseResources\`.\`resourceId\` = \`Sources\`.\`id\`
        AND \`CourseResources\`.\`resourceType\` = 'source'
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'source'
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
    `
        : `SELECT \`Sources\`.\`id\`, 
        \`Sources\`.\`title\`, 
        \`Sources\`.\`medium\`, 
        \`Sources\`.\`url\`, 
        \`Sources\`.\`tags\`, 
        \`Sources\`.\`createdBy\`, 
        \`Sources\`.\`publishedUpdated\`,
        \`Sources\`.\`lastAccessed\`, 
        \`CourseResources\`.\`courseId\`, 
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Sources\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Sources\`.\`id\`
    LEFT JOIN \`CourseResources\`
        ON \`CourseResources\`.\`resourceId\` = \`Sources\`.\`id\`
        AND \`CourseResources\`.\`resourceType\` = 'source'
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'source'
        AND \`ResourcePermissions\`.\`permitAll\` = 1`;

    const fieldsArray = userId ? [userId, userId] : [];

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
                    courses: [],
                    permissionType: s.permissionType,
                };
                sources.push(source);
            }
            if (s.courseId && !source.courses.includes(s.courseId)) {
                source.courses.push(s.courseId);
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

export async function getPermittedQuizzes(userId) {
    const baseQuery = userId
        ? `SELECT \`Quizzes\`.\`id\`, 
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
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Quizzes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Quizzes\`.\`id\`
    LEFT JOIN \`CourseResources\`
        ON \`Quizzes\`.\`id\` = \`CourseResources\`.\`resourceId\` AND \`CourseResources\`.\`resourceType\` = 'quiz'
    LEFT JOIN \`QuizNotes\`
        ON \`QuizNotes\`.\`quizId\` = \`Quizzes\`.\`id\`
    LEFT JOIN \`ResourceSources\`
        ON \`ResourceSources\`.\`resourceId\` = \`Quizzes\`.\`id\`
        AND \`ResourceSources\`.\`resourceType\` = 'quiz'
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'quiz'
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
        : `SELECT \`Quizzes\`.\`id\`, 
        \`Quizzes\`.\`type\`, 
        \`Quizzes\`.\`prompt\`, 
        \`Quizzes\`.\`choices\`,  
        \`Quizzes\`.\`correctResponses\`,   
        \`Quizzes\`.\`hints\`, 
        \`Quizzes\`.\`tags\`, 
        \`Quizzes\`.\`createdBy\`,
        \`CourseResources\`.\`courseId\`,
        \`ResourcePermissions\`.\`permissionType\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Quizzes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Quizzes\`.\`id\`
    LEFT JOIN \`CourseResources\`
        ON \`Quizzes\`.\`id\` = \`CourseResources\`.\`resourceId\` AND \`CourseResources\`.\`resourceType\` = 'quiz'
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'quiz'
        AND \`ResourcePermissions\`.\`permitAll\` = 1`;

    const fieldsArray = [userId, userId];

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
                    creator: q.createdBy,
                    courses: [],
                    notes: [],
                    sources: [],
                    permissionType: q.permissionType,
                };
                quizzes.push(quiz);
            }
            if (q.courseId) {
                quiz.courses.push(q.courseId);
            }
            if (q.noteId) {
                quiz.notes.push(q.noteId);
            }
            if (q.sourceId) {
                quiz.sources.push(q.sourceId);
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
    const allowedType = [
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
        contributorId,
    } = quiz;

    try {
        const setQuiz = {};
        if (type && allowedType.includes(type)) {
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

        return quizResults;
    } catch (error) {
        console.error(error);
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

        console.log("RESULTS QUIZZES", quizzes);
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

export async function insertPermissions(
    permissions,
    resourceId,
    resourceType,
    ownerId,
) {
    if (!permissions) {
        throw Error(
            "A permissions object is required in order to use insertPermissions",
        );
    }
    if (!resourceId) {
        throw Error(
            "A resourceId is required in order to use insertPermissions",
        );
    }
    if (
        !resourceType ||
        !["source", "note", "quiz", "course", "user", "group"].includes(
            resourceType,
        )
    ) {
        throw Error(
            "An appropriate resourceType is required in order to use insertPermissions",
        );
    }

    const permsQuery = `INSERT INTO \`ResourcePermissions\` (resourceId, resourceType, permitAll, permissionType, permittedId, permittedType) VALUES ?`;

    const permInsertValues = [];

    try {
        if (permissions.allWrite) {
            permInsertValues.push([
                resourceId,
                resourceType,
                true,
                "write",
                ownerId,
                "user",
            ]);
        }

        if (!permissions.allWrite && permissions.allRead) {
            permInsertValues.push([
                resourceId,
                resourceType,
                true,
                "read",
                ownerId,
                "user",
            ]);
        }

        if (
            !permissions.allWrite &&
            permissions.usersWrite &&
            permissions.usersWrite.length > 0
        ) {
            permInsertValues.push(
                ...permissions.usersWrite.map((user) => [
                    resourceId,
                    resourceType,
                    false,
                    "write",
                    user,
                    "user",
                ]),
            );
        }

        if (
            !permissions.allWrite &&
            !permissions.allRead &&
            permissions.usersRead &&
            permissions.usersRead.length > 0
        ) {
            permInsertValues.push(
                ...permissions.usersRead.map((user) => [
                    resourceId,
                    resourceType,
                    false,
                    "read",
                    user,
                    "user",
                ]),
            );
        }

        if (
            !permissions.allWrite &&
            permissions.groupsWrite &&
            permissions.groupsWrite.length > 0
        ) {
            permInsertValues.push(
                ...permissions.usersWrite.map((group) => [
                    resourceId,
                    resourceType,
                    false,
                    "write",
                    group,
                    "group",
                ]),
            );
        }

        if (
            !permissions.allWrite &&
            !permissions.allRead &&
            permissions.groupsRead &&
            permissions.groupsRead.length > 0
        ) {
            permInsertValues.push(
                ...permissions.groupsRead.map((group) => [
                    resourceId,
                    resourceType,
                    false,
                    "read",
                    group,
                    "group",
                ]),
            );
        }

        const [permsInsert, fields] = await db
            .promise()
            .query(permsQuery, [permInsertValues]);

        return permsInsert;
    } catch (error) {
        console.error("ERROR IN insertPermissions\n", error);
    }
}

export async function updatePermissions() {}

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

export function sqlDate(date) {
    return date.split("T")[0];
}
