import { cookies } from "next/headers";
import User from "@models/User";

export const useUser = async () => {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const user = await User.findOne({
        refreshTokens: token,
    });

    if (!user) return null;
    return user;
};
