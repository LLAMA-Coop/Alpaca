import { NextResponse } from "next/server";
// import { User } from "@mneme_app/database-models";
import { User } from "@/app/api/models";
import { SignJWT } from "jose";
import bcrypt from "bcrypt";
import { server } from "@/lib/apiErrorResponses";

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
        const user = await User.findOne({ username });

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
                .setIssuer("mnemefeast")
                .setAudience("mnemefeast")
                .sign(accessSecret);

            const refreshToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("1d")
                .setIssuer("mnemefeast")
                .setAudience("mnemefeast")
                .sign(refreshSecret);

            // Save refresh token to database
            await User.updateOne(
                { _id: user.id },
                {
                    $push: { refreshTokens: refreshToken },
                },
            );

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
