import { NextResponse } from "next/server";
// import { User } from "@mneme_app/database-models";
import { User } from "@/app/api/models";
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
        const sameUser = await User.findOne({ username: username.trim() });

        if (sameUser) {
            return NextResponse.json(
                {
                    message: "Username already taken",
                },
                { status: 400 },
            );
        }

        // const user = new User({
        //     username: username.trim(),
        //     displayName: username.trim(),
        //     passwordHash: await bcrypt.hash(password, 10),
        // });

        // await user.save();

        const displayName = username.trim();
        const passwordHash = await bcrypt.hash(password, 10);
        const sql =
            "INSERT INTO `Users` (`username`, `displayName`, `passwordHash`, `refreshTokens`) VALUES (?, ?, ?, ?)";
        const values = [username.trim(), displayName, passwordHash, '{}'];
        const [result, fields] = await db.promise().query(sql, values);
        const user = {
            id: result.insertId,
            username,
            displayName
        }
        console.log("\nUser:", user);

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
