import { db } from "@/lib/db/db.js";
import hasCommonItem from "./hasCommonItem";
import bcrypt from "bcrypt";

export const useUser = async ({ id, username, token } = {}) => {
    let fieldsArray;
    let baseQuery = `SELECT 
                    \`Users\`.\`id\`, 
                    \`Users\`.\`username\`, 
                    \`Users\`.\`displayName\`, 
                    \`Users\`.\`description\`, 
                    \`Users\`.\`avatar\`, 
                    \`Members\`.\`groupId\`, 
                    \`Groups\`.\`name\` AS \`groupName\`, 
                    \`Groups\`.\`description\` AS \`groupDesc\`, 
                    \`Courses\`.\`id\` AS \`courseId\`, 
                    \`Courses\`.\`name\` AS \`courseName\`, 
                    \`Courses\`.\`description\` AS \`courseDesc\`, 
                    \`Notifications\`.\`id\` AS \`notifId\`, 
                    \`Notifications\`.\`type\` AS \`notifType\`, 
                    \`Notifications\`.\`senderId\` AS \`notifSender\`, 
                    \`Notifications\`.\`groupId\` AS \`notifGroup\`, 
                    \`Notifications\`.\`subject\` AS \`notifSubj\`, 
                    \`Notifications\`.\`message\` AS \`notifMsg\`, 
                    \`Notifications\`.\`isRead\` AS \`notifIsRead\`,
                    \`AssocUsers\`.\`id\` AS \`assocId\`, 
                    \`AssocUsers\`.\`username\` AS \`assocName\`,
                    \`AssocUsers\`.\`displayName\` AS \`assocDisplay\`,
                    \`AssocUsers\`.\`description\` AS \`assocDesc\`,
                    \`AssocUsers\`.\`avatar\` AS \`assocAvatar\`
                FROM \`Users\` 
                LEFT JOIN 
                    \`Members\` ON \`Members\`.\`userId\` = \`Users\`.\`id\` 
                LEFT JOIN 
                    \`Groups\` ON \`Groups\`.\`id\` = \`Members\`.\`groupId\` 
                LEFT JOIN 
                    \`CourseUsers\` ON \`CourseUsers\`.\`userId\` = \`Users\`.\`id\` 
                LEFT JOIN 
                    \`Courses\` ON \`Courses\`.\`id\` = \`CourseUsers\`.\`courseId\` 
                LEFT JOIN 
                    \`Notifications\` ON \`Users\`.\`id\` = \`Notifications\`.\`recipientId\` 
                LEFT JOIN 
                    \`Associates\` ON 
                        \`Users\`.\`id\` = \`Associates\`.\`A\` 
                        OR \`Users\`.\`id\` = \`Associates\`.\`B\` 
                LEFT JOIN \`Users\` AS \`AssocUsers\` ON 
                    (\`AssocUsers\`.\`id\` != \`Users\`.\`id\` 
                    AND (\`AssocUsers\`.\`id\` = \`Associates\`.\`A\` 
                    OR \`AssocUsers\`.\`id\` = \`Associates\`.\`B\`))`;

    try {
        if (id) {
            baseQuery += `WHERE \`Users\`.\`id\` = ?`;
            fieldsArray = [id];
        }
        if (username) {
            baseQuery += `WHERE \`Users\`.\`username\` = ?`;
            fieldsArray = [username];
        }
        if (token) {
            baseQuery += `WHERE \`Users\`.\`refreshToken\` = ?`;
            fieldsArray = [token];
        }

        if (!token && !id && !username) return null;

        const [userResults, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        if (userResults.length === 0) {
            return undefined;
        }

        const user = {
            id: userResults[0].id,
            username: userResults[0].username,
            displayName: userResults[0].displayName,
            description: userResults[0].description,
            avatar: userResults[0].avatar,
            groups: [],
            associates: [],
            courses: [],
            notifications: [],
        };

        userResults.forEach((r) => {
            let group = user.groups.find((x) => x.id === r.groupId);
            let course = user.courses.find((x) => x.id === r.courseId);
            let notification = user.notifications.find(
                (x) => x.id === r.notifId,
            );
            let associate = user.associates.find((x) => x.id === r.assocId);

            if (!group && r.groupId != undefined) {
                group = { id: r.groupId };
                if (r.groupName) group.name = r.groupName;
                if (r.groupDesc) group.description = r.groupDesc;
                user.groups.push(group);
            }

            if (!course && r.courseId != undefined) {
                course = { id: r.courseId };
                if (r.courseName) course.name = r.courseName;
                if (r.courseDesc) course.description = r.courseDesc;
                user.courses.push(course);
            }

            if (!notification && r.notifId != undefined) {
                notification = { id: r.notifId };
                if (r.notifType) notification.type = r.notifType;
                if (r.notifSender) notification.senderId = r.notifSender;
                if (r.notifGroup) notification.groupId = r.notifGroup;
                if (r.notifSubj) notification.subject = r.notifSubj;
                if (r.notifMsg) notification.message = r.notifMsg;
                if (r.notifIsRead != null)
                    notification.isRead = !!r.notifIsRead;

                user.notifications.push(notification);
            }

            if (!associate && r.assocId != undefined) {
                associate = { id: r.assocId };
                if (r.assocName) associate.username = r.assocName;
                if (r.assocDisplay) associate.displayName = r.assocDisplay;
                if (r.assocDesc) associate.description = r.assocDesc;
                if (r.assocAvatar) associate.avatar = r.assocAvatar;

                user.associates.push(associate);
            }
        });

        return user;
    } catch (error) {
        console.error(error);
        // throw Error(`Error in useUser: ${error.message}`);
    }
};

// Almost the same as useUser, but compares password without returning the password or hash
export const authenticateUser = async ({
    id,
    username,
    token,
    password,
} = {}) => {
    if (!password) {
        return undefined;
    }

    let fieldsArray;
    let baseQuery = `SELECT 
                    \`Users\`.\`id\`, 
                    \`Users\`.\`username\`, 
                    \`Users\`.\`displayName\`, 
                    \`Users\`.\`description\`, 
                    \`Users\`.\`avatar\`, 
                    \`Users\`.\`passwordHash\`, 
                    \`Members\`.\`groupId\`, 
                    \`Groups\`.\`name\` AS \`groupName\`, 
                    \`Groups\`.\`description\` AS \`groupDesc\`, 
                    \`Courses\`.\`id\` AS \`courseId\`, 
                    \`Courses\`.\`name\` AS \`courseName\`, 
                    \`Courses\`.\`description\` AS \`courseDesc\`, 
                    \`Notifications\`.\`id\` AS \`notifId\`, 
                    \`Notifications\`.\`type\` AS \`notifType\`, 
                    \`Notifications\`.\`senderId\` AS \`notifSender\`, 
                    \`Notifications\`.\`groupId\` AS \`notifGroup\`, 
                    \`Notifications\`.\`subject\` AS \`notifSubj\`, 
                    \`Notifications\`.\`message\` AS \`notifMsg\`, 
                    \`Notifications\`.\`isRead\` AS \`notifIsRead\`,
                    \`AssocUsers\`.\`id\` AS \`assocId\`, 
                    \`AssocUsers\`.\`username\` AS \`assocName\`,
                    \`AssocUsers\`.\`displayName\` AS \`assocDisplay\`,
                    \`AssocUsers\`.\`description\` AS \`assocDesc\`,
                    \`AssocUsers\`.\`avatar\` AS \`assocAvatar\`
                FROM \`Users\` 
                LEFT JOIN 
                    \`Members\` ON \`Members\`.\`userId\` = \`Users\`.\`id\` 
                LEFT JOIN 
                    \`Groups\` ON \`Groups\`.\`id\` = \`Members\`.\`groupId\` 
                LEFT JOIN 
                    \`CourseUsers\` ON \`CourseUsers\`.\`userId\` = \`Users\`.\`id\` 
                LEFT JOIN 
                    \`Courses\` ON \`Courses\`.\`id\` = \`CourseUsers\`.\`courseId\` 
                LEFT JOIN 
                    \`Notifications\` ON \`Users\`.\`id\` = \`Notifications\`.\`recipientId\` 
                LEFT JOIN 
                    \`Associates\` ON 
                        \`Users\`.\`id\` = \`Associates\`.\`A\` 
                        OR \`Users\`.\`id\` = \`Associates\`.\`B\` 
                LEFT JOIN \`Users\` AS \`AssocUsers\` ON 
                    (\`AssocUsers\`.\`id\` != \`Users\`.\`id\` 
                    AND (\`AssocUsers\`.\`id\` = \`Associates\`.\`A\` 
                    OR \`AssocUsers\`.\`id\` = \`Associates\`.\`B\`))`;

    try {
        if (id) {
            baseQuery += `WHERE \`Users\`.\`id\` = ?`;
            fieldsArray = [id];
        }
        if (username) {
            baseQuery += `WHERE \`Users\`.\`username\` = ?`;
            fieldsArray = [username];
        }
        if (token) {
            baseQuery += `WHERE \`Users\`.\`refreshToken\` = ?`;
            fieldsArray = [token];
        }

        if (!token && !id && !username) return null;

        const [userResults, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        if (userResults.length === 0) {
            return undefined;
        }

        const passwordsMatch = await bcrypt.compare(
            password,
            userResults[0].passwordHash,
        );

        if (!passwordsMatch) {
            return undefined;
        }

        const user = {
            id: userResults[0].id,
            username: userResults[0].username,
            displayName: userResults[0].displayName,
            description: userResults[0].description,
            avatar: userResults[0].avatar,
            groups: [],
            associates: [],
            courses: [],
            notifications: [],
        };

        userResults.forEach((r) => {
            let group = user.groups.find((x) => x.id === r.groupId);
            let course = user.courses.find((x) => x.id === r.courseId);
            let notification = user.notifications.find(
                (x) => x.id === r.notifId,
            );
            let associate = user.associates.find((x) => x.id === r.assocId);

            if (!group && r.groupId != undefined) {
                group = { id: r.groupId };
                if (r.groupName) group.name = r.groupName;
                if (r.groupDesc) group.description = r.groupDesc;
                user.groups.push(group);
            }

            if (!course && r.courseId != undefined) {
                course = { id: r.courseId };
                if (r.courseName) course.name = r.courseName;
                if (r.courseDesc) course.description = r.courseDesc;
                user.courses.push(course);
            }

            if (!notification && r.notifId != undefined) {
                notification = { id: r.notifId };
                if (r.notifType) notification.type = r.notifType;
                if (r.notifSender) notification.senderId = r.notifSender;
                if (r.notifGroup) notification.groupId = r.notifGroup;
                if (r.notifSubj) notification.subject = r.notifSubj;
                if (r.notifMsg) notification.message = r.notifMsg;
                if (r.notifIsRead != null)
                    notification.isRead = !!r.notifIsRead;

                user.notifications.push(notification);
            }

            if (!associate && r.assocId != undefined) {
                associate = { id: r.assocId };
                if (r.assocName) associate.username = r.assocName;
                if (r.assocDisplay) associate.displayName = r.assocDisplay;
                if (r.assocDesc) associate.description = r.assocDesc;
                if (r.assocAvatar) associate.avatar = r.assocAvatar;

                user.associates.push(associate);
            }
        });

        return user;
    } catch (error) {
        console.error(error);
        // throw Error(`Error in useUser: ${error.message}`);
    }
};

export const canRead = (resource, user) => {
    if (!resource) {
        return false;
    }
    if (!user) {
        if (!resource.permissions) return true;
        return resource.permissions.allWrite || resource.permissions.allRead;
    }
    if (canEdit(resource, user)) {
        return true;
    }

    return (
        resource.permissions.allRead ||
        (resource.permissions.usersRead &&
            resource.permissions.usersRead.includes(user.id)) ||
        hasCommonItem(resource.permissions.groupsRead, user.groups)
    );
};

export const canEdit = (resource, user) => {
    if (!user) {
        return resource.permissions?.allWrite;
    }

    return (
        (resource.createdBy &&
            resource.createdBy.toString() === user.id.toString()) ||
        resource.permissions == undefined ||
        resource.permissions.allWrite ||
        (resource.permissions.usersWrite &&
            resource.permissions.usersWrite.includes(user.id)) ||
        hasCommonItem(resource.permissions.groupsWrite, user.groups)
    );
};

export const queryReadableResources = (user) => {
    if (!user) {
        return {
            $or: [
                { permissions: { $exists: false } },
                { "permissions.allWrite": true },
                { "permissions.allRead": true },
            ],
        };
    }

    let groupPerms = [];
    user.groups.forEach((groupId) => {
        groupPerms.push({ "permissions.groupsRead": { $in: [groupId] } });
        groupPerms.push({ "permissions.groupsWrite": { $in: [groupId] } });
    });

    return {
        $or: [
            { createdBy: user.id },
            { permissions: { $exists: false } },
            { "permissions.allWrite": true },
            { "permissions.allRead": true },
            { "permissions.usersRead": { $in: [user.id] } },
            { "permissions.usersWrite": { $in: [user.id] } },
            ...groupPerms,
        ],
    };
};

export const queryWritableResources = {};
