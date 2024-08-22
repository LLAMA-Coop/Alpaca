export const permissionsListToObject = (permissionsList) => {
    const permissions = {
        allWrite: false,
        allRead: false,
        usersWrite: [],
        usersRead: [],
        groupsWrite: [],
        groupsRead: [],
    };

    permissionsList.forEach((perm) => {
        if (perm.permitAll && perm.permissionType === "write") {
            permissions.allWrite = true;
        }
        if (perm.permitAll && perm.permissionType === "read") {
            permissions.allRead = true;
        }
        if (perm.permittedType === "user" && perm.permissionType === "read") {
            permissions.usersRead.push(perm.permittedId);
        }
        if (perm.permittedType === "user" && perm.permissionType === "write") {
            permissions.usersWrite.push(perm.permittedId);
        }
        if (perm.permittedType === "group" && perm.permissionType === "read") {
            permissions.groupsRead.push(perm.permittedId);
        }
        if (perm.permittedType === "group" && perm.permissionType === "write") {
            permissions.groupsWrite.push(perm.permittedId);
        }
    });

    return permissions;
};

export const buildPermissions = (permissions, resourceId, resourceType) => {
    const {
        allRead,
        allWrite,
        usersRead,
        usersWrite,
        groupsRead,
        groupsWrite,
    } = permissions;
    const permissionList = [];
    if (!permissions) {
        return permissionList;
    }

    if (allWrite === true) {
        permissionList.push({
            resourceId,
            resourceType,
            permitAll: true,
            permissionType: "write",
        });
        return permissionList;
    }

    if (!allRead) {
        if (usersRead && usersRead.length > 0) {
            usersRead.forEach((user) => {
                permissionList.push({
                    resourceId,
                    resourceType,
                    permissionType: "read",
                    permittedId: user.id,
                    permittedType: "user",
                });
            });
        }

        if (groupsRead && groupsRead.length > 0) {
            groupsRead.forEach((group) => {
                permissionList.push({
                    resourceId,
                    resourceType,
                    permissionType: "read",
                    permittedId: group.id,
                    permittedType: "group",
                });
            });
        }
    }

    if (usersWrite && usersWrite.length > 0) {
        usersWrite.forEach((user) => {
            permissionList.push({
                resourceId,
                resourceType,
                permissionType: "write",
                permittedId: user.id,
                permittedType: "user",
            });
        });
    }

    if (groupsWrite && groupsWrite.length > 0) {
        groupsWrite.forEach((group) => {
            permissionList.push({
                resourceId,
                resourceType,
                permissionType: "write",
                permittedId: group.id,
                permittedType: "group",
            });
        });
    }

    return permissionList;
};

export function doesUserMeetPrerequisites(courses, prerequisites) {
    // for the function to return true, the user must have all of the courses
    // listed in the prerequisites array, as well as the required average level
    // for each course

    prerequisites.forEach((prerequisite) => {
        const course = courses.find((c) => c.course === prerequisite.course);
        if (!course) return false;

        if (course.progress < prerequisite.averageLevelRequired) return false;
    });

    return true;
}
