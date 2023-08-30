import { NextResponse } from "next/server";
// import User from "@models/User";
import { User } from "@mneme_app/database-models";
import { useUser } from "@/lib/auth";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { serializeOne } from "@/lib/db";

export async function GET(req) {
    const userId = req.nextUrl.pathname.split("/")[3];

    try {
        const user = serializeOne(await useUser());
        console.log(user.id, user.roles);
        if (
            !user ||
            (user.id !== userId && user.roles.indexOf("admin") === -1)
        ) {
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
