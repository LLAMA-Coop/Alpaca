import { db } from "./db";

export function getPermittedResources(userId) {
    const resources = {
        sources: [],
        notes: [],
        quizzes: [],
        courses: [],
        users: [],
    };

    try {
        let baseQuery = `SELECT \`ResourcePermissions\`.\`resourceId\`
        \`ResourcePermissions\`.\`resourceType\`

        FROM \`ResourcePermissions\` `;

        // Get groupIds for which userId is a member
        // Track their role, tho I don't think it effects permissions for resource
    } catch (error) {
        console.error(error);
    }

    return resources;
}

export async function getPermittedSources(userId) {
    const sources = [];

    let baseQuery = `SELECT \`Sources\`.\`id\`, 
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
        AND (\`ResourcePermissions\`.\`permitAll\` = 1 OR 
            (\`ResourcePermissions\`.\`permitAll\` = 'user' AND
                \`ResourcePermissions\`.\`permittedId\` = ?
            ) 
        )
    `;

    const fieldsArray = [userId];

    // Later add groupId's that are relevant
    // Then add a string for that many '?'s and push the groupId's to fieldsArray

    try {
        const [sourceResults, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);
        console.log("\nSource Results", sourceResults);
        sources.push(...sourceResults);
    } catch (error) {
        console.error(error);
    }

    return sources;
}
