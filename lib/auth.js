import { cookies } from "next/headers";
import User from "@models/User";
import hasCommonItem from "./hasCommonItem";

export const useUser = async ({ id, username } = {}) => {
    if (id) return await User.findById(id);
    else if (username) return await User.findOne({ username });

    const token = cookies().get("token")?.value;
    if (!token) return null;

    return await User.findOne({ refreshTokens: token });
};

export const canRead = (resource, user) => {
    if (!user) {
        return resource.permissions.allRead || resource.permissions.allWrite;
    }
    if (canEdit(resource, user)) {
        return true;
    }

    return (
        resource.permissions.allRead ||
        (resource.permissions.usersRead &&
            resource.permissions.usersRead.includes(user._id)) ||
        hasCommonItem(resource.permissions.groupsRead, user.groups)
    );
};

export const canEdit = (resource, user) => {
    if (!user) {
        return resource.permissions.allWrite;
    }

    return (
        resource.createdBy === user._id ||
        resource.permissions == undefined ||
        resource.permissions.length === 0 ||
        resource.permissions.allWrite ||
        (resource.permissions.usersWrite &&
            resource.permissions.usersWrite.includes(user._id)) ||
        hasCommonItem(resource.permissions.groupsWrite, user.groups)
    );
};

export const queryReadableResources = {};

export const queryWritableResources = {};
