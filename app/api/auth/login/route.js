import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcrypt";
import { server } from "@/lib/apiErrorResponses";
import { db } from "@/lib/db/db";

export async function POST(req) {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json(
            {
                message: "Login or password is invalid",
            },
            { status: 400 },
        );
    }

    try {
        const [users, fields] = await db
            .promise()
            .query(
                "SELECT `id`, `passwordHash` FROM Users WHERE username = ? LIMIT 1",
                [username],
            );
        const user = users[0];

        if (!user) {
            return NextResponse.json(
                {
                    message: "Login or password is invalid",
                },
                { status: 401 },
            );
        }

        const passwordsMatch = await bcrypt.compare(
            password,
            user.passwordHash,
        );

        if (passwordsMatch) {
            const accessSecret = new TextEncoder().encode(
                process.env.ACCESS_TOKEN_SECRET,
            );
            const refreshSecret = new TextEncoder().encode(
                process.env.REFRESH_TOKEN_SECRET,
            );

            // Generate access and refresh tokens
            const accessToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("1h")
                .setIssuer("Alpaca")
                .setAudience("Alpaca")
                .sign(accessSecret);

            const refreshToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("1d")
                .setIssuer("Alpaca")
                .setAudience("Alpaca")
                .sign(refreshSecret);

            console.log("REFRESH", refreshToken);

            const [resultsUpdate, fieldsUpdate] = await db
                .promise()
                .query("UPDATE Users SET refreshToken = ? WHERE id = ?", [
                    refreshToken,
                    user.id,
                ]);
            console.log("\nUPDATE TOKENS", resultsUpdate, fieldsUpdate);

            return NextResponse.json(
                {
                    content: user,
                    token: accessToken,
                },
                {
                    status: 200,
                    headers: {
                        "Set-Cookie": `token=${refreshToken}; path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`,
                    },
                },
            );
        } else {
            return NextResponse.json(
                {
                    message: "Login or password is invalid",
                },
                { status: 401 },
            );
        }
    } catch (error) {
        console.error(error);
        return server;
    }
}
