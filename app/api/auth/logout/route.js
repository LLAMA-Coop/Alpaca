import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// import { User } from "@mneme_app/database-models";
import { User } from "@/app/api/models";
import { server } from "@/lib/apiErrorResponses";
import { useUser } from "@/lib/auth";

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
        // const user = await User.findOne({
        //     refreshTokens: token,
        // });
        const user = await useUser({ token });

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

        await db
            .promise()
            .query(
                "UPDATE `Users` SET `refreshToken` = '' WHERE `id` = ?",
                user.id,
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
        return server;
    }
}
