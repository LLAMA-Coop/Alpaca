import { getToken, catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import { logToFile } from "@/lib/log";

function getIp() {
    let forwardedFor = headers().get("x-forwarded-for");
    let realIp = headers().get("x-real-ip");

    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    if (realIp) return realIp.trim();

    return "0.0.0.0";
}

function isCorrectIP(ip) {
    return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip);
}

export async function POST(req) {
    const { username, password } = await req.json();

    try {
        const select = ["id", "username", "password", "tokens", "twoFactorEnabled"];

        let user = await db
            .selectFrom("users")
            .select([...select, "emailVerified"])
            .where("email", "=", username)
            .executeTakeFirst();

        if (!user) {
            user = await db
                .selectFrom("users")
                .select(select)
                .where("username", "=", username)
                .executeTakeFirst();
        } else if (user.emailVerified === 0) {
            return NextResponse.json(
                {
                    errors: {
                        username: "Please verify your email address before logging in using it",
                        password: "Please verify your email address before logging in using it",
                    },
                },
                { status: 401 }
            );
        }

        if (!user) {
            return NextResponse.json(
                {
                    errors: {
                        username: "Incorrect credentials provided",
                        password: "Incorrect credentials provided",
                    },
                },
                { status: 401 }
            );
        }

        if (await bcrypt.compare(password, user.password)) {
            if (user.twoFactorEnabled) {
                const token = nanoid(32);

                await db
                    .updateTable("users")
                    .set({
                        twoFactorTemp: token,
                    })
                    .where("id", "=", user.id)
                    .execute();

                return NextResponse.json(
                    {
                        message: "Two factor authentication is enabled",
                        code: token,
                    },
                    { status: 200 }
                );
            }

            const refreshToken = await getToken(user.username, true);
            const accessToken = await getToken(user.username, false);

            const userAgent = headers().get("user-agent") || "Unknown";
            const ip = getIp();
            logToFile(`User ${user.username} logged in from ${ip} with user agent ${userAgent}`);
            let location = {
                city: "Unknown",
                region: "Unknown",
                country: "Unknown",
            };

            if (isCorrectIP(ip)) {
                try {
                    const {
                        city,
                        region,
                        country_name: country,
                    } = await fetch(`https://ipapi.co/${ip}/json/`).then((res) => res.json());

                    location = {
                        city,
                        region,
                        country,
                    };
                } catch (error) {
                    console.error("Error getting location from IP", error);
                }
            }

            const tokenObject = {
                token: refreshToken,
                login: Date.now(),
                expires: Date.now() + 2592000000,
                userAgent,
                location,
                device: getDeviceFromUserAgent(userAgent),
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
                .execute();

            return NextResponse.json(
                {
                    token: accessToken,
                    message: "Successfully logged in",
                },
                {
                    status: 200,
                    headers: {
                        "Set-Cookie": `token=${refreshToken}; path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`,
                    },
                }
            );
        } else {
            return NextResponse.json(
                {
                    errors: {
                        username: "Incorrect credentials provided",
                        password: "Incorrect credentials provided",
                    },
                },
                { status: 401 }
            );
        }
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

function getDeviceFromUserAgent(userAgent) {
    if (userAgent.includes("Mobile")) return "Mobile";
    if (userAgent.includes("Tablet")) return "Tablet";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Macintosh")) return "Macintosh";
    if (userAgent.includes("Linux")) return "Linux";
    return "Unknown";
}
