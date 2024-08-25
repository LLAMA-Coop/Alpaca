import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { SignJWT } from "jose";
import { db } from "./db";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

if (!accessTokenSecret || !refreshTokenSecret) {
    console.error("No access or refresh token secrets found.");
}

export function catchRouteError({ error, route }) {
    console.error(`[ERROR] Error in ${route}:`, error);
    return NextResponse.json(
        {
            message: "Something went wrong. Please try again later.",
        },
        { status: 500 },
    );
}

export function getNanoId() {
    const alphabet = "123456789ABCDEFGHKMNPQRSTUVWXYZ";
    const nanoid = customAlphabet(alphabet, 12);
    return nanoid();
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
        console.error(error);
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
    const url = process.env.BASE_URL || "localhost";

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
        console.error(error);
    }
}

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
        \`sources\`.\`id\` AS \`id\`,
        \`sources\`.\`title\` AS \`title\`,
        \`sources\`.\`medium\` AS \`medium\`,
        \`sources\`.\`url\` AS \`url\`,
        \`sources\`.\`tags\` AS \`tags\`,
        \`sources\`.\`createdBy\` AS \`createdBy\`,
        \`sources\`.\`updatedAt\` AS \`updatedAt\`,
        \`sources\`.\`lastAccessed\`,
        NULL AS \`text\`,
        NULL AS \`type\`,
        NULL AS \`prompt\`,
        NULL AS \`choices\`,
        NULL AS \`answers\`,
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
    const baseQuery = `SELECT \`Quizzes\`.\`id\`, 
        \`Quizzes\`.\`type\`, 
        \`Quizzes\`.\`prompt\`, 
        \`Quizzes\`.\`choices\`,  
        \`Quizzes\`.\`correctResponses\`,   
        \`Quizzes\`.\`hints\`, 
        \`Quizzes\`.\`tags\`, 
        \`Quizzes\`.\`createdBy\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Quizzes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Quizzes\`.\`id\`
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
    `;

    const fieldsArray = [userId, userId];

    try {
        const [quizzes, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

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
    // Add parent courses and prereqs
    // Add user status (unenrolled, enrolled, etc.)

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

export function sqlDate(date) {
    return date.split("T")[0];
}
