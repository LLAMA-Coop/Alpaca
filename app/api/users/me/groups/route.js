import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import User from "@models/User";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { useRouter } from "next/router";

export async function GET(req) {
    const router = useRouter();
    const userId = router.query.userId;
    
    try {
        const user = await useUser();

        if (!user) {
            return unauthorized;
        }

        return await User.findOne({ _id: user._id }).populate("groups").groups;
    } catch (error) {
        console.error(`[${userId}/me] GET error: ${error}`);
        return server;
    }
}
