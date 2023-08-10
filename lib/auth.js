import { cookies } from "next/headers";
import User from "@models/User";

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
