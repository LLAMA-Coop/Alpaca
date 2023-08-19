import { NextResponse } from "next/server";
import User from "@models/User";
import { useUser } from "@/lib/auth";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { useRouter } from "next/router";

export async function GET(req) {
    const router = useRouter();
    const userId = router.query.userId;

    try {
        const user = await useUser();

        // Oops! user is allowed to access own info
        if (!user || !user.roles.contains("admin")) {
            return unauthorized;
        }

        const content = await User.find();
        return NextResponse.json({
            200: {
                content,
            },
        });
    } catch (error) {
        console.error(`User [${userId}] GET error: ${error}`);
        return server;
    }
}
