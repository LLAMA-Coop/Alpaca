export const getPermission = (user, permissions) => {};

export const buildPermissions = (permissions) => {
    const payload = {};
    if (!permissions) {
        payload.allRead = false;
        payload.allWrite = false;
        return payload;
    }

    if (permissions.allRead === true && permissions.allWrite === true) {
        payload.allRead = true;
        payload.allWrite = true;
        return payload;
    }

    payload.allRead = permissions.allRead || false;
    payload.allWrite = permissions.allWrite || false;
    if (!payload.allRead) {
        if (permissions.usersRead && permissions.usersRead.length > 0)
            payload.usersRead = [...permissions.usersRead];

        if (permissions.groupsRead && permissions.groupsRead.length > 0)
            payload.groupsRead = [...permissions.groupsRead];
    }

    return payload;
};
