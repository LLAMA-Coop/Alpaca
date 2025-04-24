import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req) {
    try {
        const user = await useUser({
            token: (await cookies()).get("token")?.value,
            select: ["id", "twoFactorEnabled"],
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

        const newCodes = generateCodes();

        await db
            .updateTable("users")
            .set({
                twoFactorRecovery: JSON.stringify(newCodes),
            })
            .where("id", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                message: "2FA recovery codes regenerated",
                codes: newCodes,
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

    return codes.map((code) => {
        return {
            code,
            used: false,
        };
    });
}
