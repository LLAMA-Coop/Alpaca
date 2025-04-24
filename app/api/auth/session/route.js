import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function DELETE(req) {
    const { session, all } = await req.json();

    try {
        const user = await useUser({
            token: (await cookies()).get("token")?.value,
            select: ["id", "tokens"],
        });

        if (!user) return unauthorized;

        if (all) {
            await db
                .updateTable("users")
                .set({
                    tokens: JSON.stringify([]),
                })
                .where({ id: user.id })
                .execute();

            return NextResponse.json(
                {
                    message: "All sessions deleted",
                },
                { status: 200 }
            );
        } else if (!session) {
            return NextResponse.json(
                {
                    message: "Session not found",
                },
                { status: 404 }
            );
        }

        const { userAgent, ip } = session;

        const token = user.tokens.find((t) => {
            return t.ip === ip && t.userAgent === userAgent;
        });

        if (!token) {
            return NextResponse.json(
                {
                    message: "Session not found",
                },
                { status: 404 }
            );
        }

        await db
            .updateTable("users")
            .set({
                tokens: JSON.stringify(user.tokens.filter((t) => t.token !== token.token)),
            })
            .where("id", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                message: "Session deleted",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
