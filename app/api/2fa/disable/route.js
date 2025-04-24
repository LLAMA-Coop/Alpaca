import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { verifyToken } from "node-2fa";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req) {
    const { code } = await req.json();

    try {
        const user = await useUser({
            token: (await cookies()).get("token")?.value,
            select: ["id", "twoFactorEnabled", "twoFactorSecret", "twoFactorRecovery"],
        });

        if (!user) return unauthorized;

        if (!user.twoFactorEnabled) {
            return NextResponse.json(
                {
                    message: "2FA is already enabled",
                },
                { status: 400 }
            );
        }

        if (!user.twoFactorSecret) {
            return NextResponse.json(
                {
                    message: "2FA secret not found",
                },
                { status: 500 }
            );
        }

        const verif = verifyToken(user.twoFactorSecret, code);

        if (!verif) {
            const exists = user.twoFactorRecovery.find((c) => c.code === code && !c.used);

            if (!exists) {
                return NextResponse.json(
                    {
                        message: "Invalid 2FA code or recovery code",
                    },
                    { status: 400 }
                );
            }
        }

        await db
            .updateTable("users")
            .set({
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorTemp: null,
                twoFactorRecovery: null,
            })
            .where("id", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                message: "Successfully disabled 2FA",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
