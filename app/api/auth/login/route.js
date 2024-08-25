import { getToken, catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";
import bcrypt from "bcrypt";

function IP() {
    const FALLBACK_IP_ADDRESS = "0.0.0.0";
    const forwardedFor = headers().get("x-forwarded-for");

    if (forwardedFor) {
        return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
    }

    return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

export async function POST(req) {
    const { username, password } = await req.json();

    try {
        const user = await db
            .selectFrom("users")
            .select(["id", "username", "password", "tokens"])
            .where("username", "=", username)
            .executeTakeFirst();

        if (!user) {
            return NextResponse.json(
                {
                    errors: {
                        username: "Username or password is invalid.",
                        password: "Username or password is invalid.",
                    },
                },
                { status: 401 },
            );
        }

        if (await bcrypt.compare(password, user.password)) {
            const refreshToken = await getToken(user.username, true);
            const accessToken = await getToken(user.username, false);

            const userAgent = headers().get("user-agent") || "";
            const ip = IP();

            const tokenObject = {
                token: refreshToken,
                expires: Date.now() + 2592000000,
                userAgent,
                ip,
            };

            // To prevent someone loggin in a lot of times and filling up the tokens array
            // we also want to filter out tokens where the user agent or ip is the same
            // Refrain from using ip though, as someone could be using more than one browser on the same device
            const newTokens = [
                ...user.tokens.filter((token) => {
                    return (
                        token.expires > Date.now() &&
                        (token.ip === ip ? token.userAgent !== userAgent : true)
                    );
                }),
                tokenObject,
            ];

            await db
                .updateTable("users")
                .set({
                    tokens: JSON.stringify(newTokens),
                })
                .where("id", "=", user.id)
                .executeTakeFirst();

            return NextResponse.json(
                {
                    token: accessToken,
                    message: "Successfully logged in.",
                },
                {
                    status: 200,
                    headers: {
                        "Set-Cookie": `token=${refreshToken}; path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`,
                    },
                },
            );
        } else {
            return NextResponse.json(
                {
                    errors: {
                        username: "Username or password is invalid.",
                        password: "Username or password is invalid.",
                    },
                },
                { status: 401 },
            );
        }
    } catch (error) {
        catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
