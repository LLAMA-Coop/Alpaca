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
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'source' 
        AND (
            \`ResourcePermissions\`.\`permitAll\` = 1 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'user' AND \`ResourcePermissions\`.\`permittedId\` = ?) 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND \`ResourcePermissions\`.\`permittedId\` IN (
                SELECT \`groupId\` 
                FROM \`GroupUsers\` 
                WHERE \`userId\` = ?
            ))
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
                \`ResourcePermissions\`.\`permittedId\` = ?
            ) 
            OR 
            (\`ResourcePermissions\`.\`permittedType\` = 'group' AND 
                \`ResourcePermissions\`.\`permittedId\` IN (
                SELECT \`groupId\` 
                FROM \`GroupUsers\` 
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
                FROM \`GroupUsers\` 
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
            }
        });
    } catch (error) {
        console.error(error);
    }

    return resources;
}

export async function getPermittedSources(userId) {
    const baseQuery = `SELECT \`Sources\`.\`id\`, 
        \`Sources\`.\`title\`, 
        \`Sources\`.\`medium\`, 
        \`Sources\`.\`url\`, 
        \`Sources\`.\`tags\`, 
        \`Sources\`.\`createdBy\`, 
        \`Sources\`.\`publishedUpdated\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Sources\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Sources\`.\`id\`
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
                    FROM \`GroupUsers\`
                    WHERE \`userId\` = ?
                )
            )
        )
    `;

    const fieldsArray = [userId, userId];

    // Later add groupId's that are relevant
    // Then add a string for that many '?'s and push the groupId's to fieldsArray

    try {
        const [sources, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        return sources;
    } catch (error) {
        console.error(error);
    }

    // return sources;
}

export async function getPermittedNotes(userId) {
    const baseQuery = `SELECT \`Notes\`.\`id\`, 
        \`Notes\`.\`title\`, 
        \`Notes\`.\`text\`, 
        \`Notes\`.\`tags\`, 
        \`Notes\`.\`createdBy\`
    FROM \`ResourcePermissions\`
    LEFT JOIN \`Notes\` 
        ON \`ResourcePermissions\`.\`resourceId\` = \`Notes\`.\`id\`
    WHERE \`ResourcePermissions\`.\`resourceType\` = 'note'
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
                    FROM \`GroupUsers\`
                    WHERE \`userId\` = ?
                )
            )
        )
    `;

    const fieldsArray = [userId, userId];

    try {
        const [notes, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        return notes;
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
                    FROM \`GroupUsers\`
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
        \`Superior\`.\`name\` AS \`superiorName\`
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
                    FROM \`GroupUsers\`
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
    FROM \`GroupUsers\`
    LEFT JOIN \`Groups\` ON \`GroupUsers\`.\`groupId\` = \`Groups\`.\`id\`
    WHERE \`GroupUsers\`.\`userId\` = ? 
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
