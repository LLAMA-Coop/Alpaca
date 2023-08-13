import { cookies } from "next/headers";
import User from "@models/User";

export const useUser = async ({ id, username } = {}) => {
    if (id) return await User.findById(id);
    else if (username) return await User.findOne({ username });

    const token = cookies().get("token")?.value;
    if (!token) return null;

    return await User.findOne({ refreshTokens: token });
};
