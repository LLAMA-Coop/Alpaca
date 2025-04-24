import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req) {
    try {
        const token = (await cookies()).get("token")?.value || "";
        const user = await useUser({ token, select: ["id", "tokens"] });

        if (user) {
            const newTokens = user.tokens.filter((t) => t.token !== token);

            if (newTokens.length !== user.tokens.length) {
                await db
                    .updateTable("users")
                    .set({
                        tokens: JSON.stringify(newTokens),
                    })
                    .where("id", "=", user.id)
                    .execute();
            }
        }

        return NextResponse.json(
            {
                message: "Successfully logged out",
            },
            {
                status: 200,
                headers: {
                    "Set-Cookie": `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=0;`,
                },
            },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
