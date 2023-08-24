import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import User from "@models/User";
import { server, unauthorized } from "@/lib/apiErrorResponses";

export async function GET(req) {
    const userId = req.nextUrl.pathname.split(/\/|\?/)[3];

    try {
        const user = await useUser();

        if (!user) {
            return unauthorized;
        }

        const content = await User.findOne({ _id: user._id }).populate("groups")
            .groups;
        return NextResponse.json({
            200: {
                content,
            },
        });
    } catch (error) {
        console.error(`[${userId}/me] GET error: ${error}`);
        return server;
    }
}
