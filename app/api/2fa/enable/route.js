import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { verifyToken } from "node-2fa";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req) {
    const { code } = await req.json();

    try {
        const user = await useUser({
            token: (await cookies()).get("token")?.value,
            select: ["id", "twoFactorEnabled", "twoFactorSecret"],
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
            return NextResponse.json(
                {
                    message: "Invalid 2FA code",
                },
                { status: 400 }
            );
        }

        // Generate random codes
        const codes = generateCodes();

        await db
            .updateTable("users")
            .set({
                twoFactorEnabled: true,
                twoFactorRecovery: JSON.stringify(codes),
            })
            .where("id", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                message: "2FA enabled successfully",
                codes,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

function generateCodes() {
    const codes = [];

    const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);

    for (let i = 0; i < 16; i++) {
        const first = nanoid();
        const second = nanoid();

        codes.push(`${first}-${second}`);
    }

    return codes.map((code) => ({
        code,
        used: false,
    }));
}
