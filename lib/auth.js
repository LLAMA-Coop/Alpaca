import { cookies } from "next/headers";
import User from "@models/User";
import Quiz from "@/app/api/models/Quiz";

export const useUser = async ({ id, username } = {}) => {
    if (id) {
        const user = await User.findById(id);
        return user;
    } else if (username) {
        const user = await User.findOne({ username });
        return user;
    }

    const token = cookies().get("token")?.value;
    if (!token) return null;

    const user = await User.findOne({
        refreshTokens: token,
    });

    return user;
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
