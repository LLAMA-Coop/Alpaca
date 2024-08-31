import { getNanoId, catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import bcrypt from "bcrypt";
import { validation } from "@/lib/validation";

export async function POST(req) {
    const { username, password } = await req.json();

    const name = username.trim();
    const publicId = getNanoId();

    if (!(name && password)) {
        return NextResponse.json(
            {
                errors: {
                    username: "Username is required.",
                    password: "Password is required.",
                },
            },
            { status: 400 },
        );
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:]).{8,72}$/g;
    const usernameRegex = /^.{2,32}$/g;

    if (!passwordRegex.test(password)) {
        return NextResponse.json(
            {
                errors: {
                    password: validation.user.password.error,
                },
            },
            { status: 400 },
        );
    }

    if (!usernameRegex.test(name)) {
        return NextResponse.json(
            {
                errors: {
                    username: validation.user.username.error,
                },
            },
            { status: 400 },
        );
    }

    try {
        const exists = await db
            .selectFrom("users")
            .select("id")
            .where("username", "=", name)
            .executeTakeFirst();

        if (exists) {
            return NextResponse.json(
                {
                    errors: {
                        username: "Username is already taken.",
                    },
                },
                { status: 400 },
            );
        }

        await db
            .insertInto("users")
            .values({
                publicId,
                username: name,
                displayName: name,
                password: await bcrypt.hash(password, 10),
                tokens: JSON.stringify([]),
            })
            .execute();

        return NextResponse.json(
            {
                message: "User registered successfully.",
            },
            { status: 201 },
        );
    } catch (error) {
        db.deleteFrom("users").where("publicId", "=", publicId).execute();
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
