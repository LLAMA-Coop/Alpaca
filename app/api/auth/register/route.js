import { NextResponse } from "next/server";
import User from "@models/User";
import bcrypt from "bcrypt";

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
        const sameUser = await User.findOne({ username });

        console.log(username);
        console.log(sameUser);

        if (sameUser) {
            return NextResponse.json(
                {
                    message: "Username already taken",
                },
                { status: 400 },
            );
        }

        // Default role only
        // An admin will have to add role through PUT

        const user = new User({
            username: username.trim(),
            displayName: username.trim(),
            passwordHash: await bcrypt.hash(password, 10),
        });

        await user.save();

        return NextResponse.json(
            {
                content: user,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[REGISTER] POST error: ${error}`);
        return NextResponse.json(
            {
                message: "Username already exists.",
            },
            { status: 400 },
        );
    }
}