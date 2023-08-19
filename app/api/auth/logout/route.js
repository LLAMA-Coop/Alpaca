import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import User from "@models/User";
import { server } from "@/lib/apiErrorResponses";

export async function POST(req) {
    const token = cookies().get("token")?.value;

    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: "No cookie found",
            },
            { status: 401 },
        );
    }

    try {
        const user = await User.findOne({
            refreshTokens: token,
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No user found",
                },
                {
                    status: 400,
                    headers: {
                        "Set-Cookie": `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
                    },
                },
            );
        }

        await User.updateOne(
            {
                _id: user._id,
            },
            {
                $pull: {
                    refreshTokens: token,
                },
            },
        );

        return NextResponse.json(
            {
                success: true,
                message: "Logged out",
            },
            {
                status: 200,
                headers: {
                    "Set-Cookie": `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=0;`,
                },
            },
        );
    } catch (error) {
        console.error(`[LOGOUT] POST error: ${error}`);
        return server
    }
}
