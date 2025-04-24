import { getToken, catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { verifyToken } from "node-2fa";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

function isCorrectIP(ip) {
    return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip);
}

export async function POST(req) {
    const { token, code, recovery } = await req.json();
    let newCodes = null;

    try {
        const user = await db
            .selectFrom("users")
            .select(["id", "tokens", "twoFactorSecret", "twoFactorRecovery"])
            .where("twoFactorTemp", "=", token)
            .executeTakeFirst();

        if (!user) {
            return NextResponse.json(
                {
                    errors: {
                        token: "Invalid token provided - you need to login again",
                    },
                },
                { status: 401 }
            );
        }

        if (!user.twoFactorSecret) {
            return NextResponse.json(
                {
                    errors: {
                        token: "Two factor authentication is not enabled for this account",
                    },
                },
                { status: 401 }
            );
        }

        if (recovery) {
            const isIncluded = user.twoFactorRecovery.find((r) => r.code === recovery && !r.used);

            if (!isIncluded) {
                return NextResponse.json(
                    {
                        errors: {
                            code: "Invalid recovery code provided",
                        },
                    },
                    { status: 401 }
                );
            }

            newCodes = user.twoFactorRecovery.map((r) => {
                if (r.code === recovery) {
                    return {
                        code: r.code,
                        used: true,
                    };
                }

                return r;
            });
        } else {
            const verified = verifyToken(user.twoFactorSecret, code);

            if (!verified) {
                return NextResponse.json(
                    {
                        errors: {
                            code: "Invalid code provided",
                        },
                    },
                    { status: 401 }
                );
            }
        }

        const refreshToken = await getToken(user.username, true);
        const accessToken = await getToken(user.username, false);

        const userAgent = (await headers()).get("user-agent") || "Unknown";
        // const ip = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
        const ip = "91.162.93.92";
        let location = {};

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
                twoFactorTemp: null,
                twoFactorRecovery: newCodes ? JSON.stringify(newCodes) : undefined,
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
