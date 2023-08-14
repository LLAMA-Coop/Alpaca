import { cookies } from "next/headers";
import User from "@models/User";
import Quiz from "@/app/api/models/Quiz";

export const useUser = async ({ id, username } = {}) => {
    if (id) return await User.findById(id);
    else if (username) return await User.findOne({ username });

    const token = cookies().get("token")?.value;
    if (!token) return null;

    return await User.findOne({ refreshTokens: token });
};

export const canEdit = (resource, id) => {
    return (
        resource.createdBy === id ||
        resource.permissions == undefined ||
        resource.permissions.length === 0 ||
        resource.permissions[0].allWrite ||
        (resource.permissions.usersWrite &&
            resource.permissions.usersWrite.includes(id))
    );
};
