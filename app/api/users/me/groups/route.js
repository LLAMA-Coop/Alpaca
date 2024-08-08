import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { getUserGroups } from "@/lib/db/helpers";

export async function GET(req) {
    const userId = req.nextUrl.pathname.split("/")[3];

    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const content = await getUserGroups(user.id);
        return NextResponse.json({
            content,
        });
    } catch (error) {
        console.error(`[${userId}/me] GET error: ${error}`);
        return server;
    }
}
