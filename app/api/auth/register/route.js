import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { server } from "@/lib/apiErrorResponses";
import { db } from "@/lib/db/db";

export async function POST(req) {
    // This may or may not require admin authorization
    // For now, anybody can make account

    const { username, password } = await req.json();

    if (!(username && password)) {
        return NextResponse.json(
            {
                message: "Username and password required",
            },
            { status: 400 },
        );
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:]).{8,}$/g;

    if (!pwdRegex.test(password)) {
        return NextResponse.json(
            {
                message: "Password does not meet requirements.",
            },
            { status: 400 },
        );
    }

    if (!/^.{2,32}$/.test(username)) {
        return NextResponse.json(
            {
                message: "Username does not meet requirements.",
            },
            { status: 400 },
        );
    }

    try {
        const [resultSameUser, fieldsSame] = await db
            .promise()
            .query("SELECT `id` FROM Users WHERE username = ? LIMIT 1", [username.trim()]);

        if (resultSameUser.length > 0) {
            return NextResponse.json(
                {
                    message: "Username already taken",
                },
                { status: 400 },
            );
        }

        const displayName = username.trim();
        const passwordHash = await bcrypt.hash(password, 10);
        const sql =
            "INSERT INTO `Users` (`username`, `displayName`, `passwordHash`, `refreshTokens`) VALUES (?, ?, ?, ?)";
        const values = [username.trim(), displayName, passwordHash, "{}"];
        const [result, fields] = await db.promise().query(sql, values);
        const user = {
            id: result.insertId,
            username,
            displayName,
        };

        return NextResponse.json(
            {
                content: user,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[REGISTER] POST error: ${error}`);
        return server;
    }
}
