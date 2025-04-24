import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { generateSecret } from "node-2fa";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req) {
    try {
        const user = await useUser({
            token: (await cookies()).get("token")?.value,
            select: ["id", "username", "email", "emailVerified", "twoFactorEnabled"],
        });

        if (!user) return unauthorized;

        if (user.twoFactorEnabled) {
            return NextResponse.json(
                {
                    message: "2FA is already enabled",
                },
                { status: 400 }
            );
        }

        const { secret, uri } = generateSecret({
            name: "Alpaca",
            account: user.emailVerified ? user.email : user.username,
        });

        await db
            .updateTable("users")
            .set({
                twoFactorSecret: secret,
            })
            .where("id", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                secret,
                uri,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
