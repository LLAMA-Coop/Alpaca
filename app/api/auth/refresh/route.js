import { catchRouteError, getToken } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req) {
    const token = (await cookies()).get("token")?.value;

    try {
        const user = await useUser({
            token,
            select: ["id", "username", "tokens"],
        });

        if (!user) return unauthorized;

        const currentToken = user.tokens.find((obj) => obj.token === token);
        const isTokenValid = currentToken && currentToken.expires > Date.now();

        // Take the opportunity to remove expired tokens
        const newTokens = user.tokens.filter((obj) => obj.expires > Date.now());

        if (user.tokens.length !== newTokens.length) {
            db.updateTable("users")
                .set({
                    tokens: JSON.stringify(newTokens),
                })
                .where("id", "=", user.id)
                .execute();
        }

        if (!isTokenValid) return unauthorized;

        const newToken = await getToken(user.username);

        return NextResponse.json({
            message: "Successfully refreshed token",
            token: newToken,
        });
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
