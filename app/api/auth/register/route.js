import { getNanoId, catchRouteError } from "@/lib/db/helpers";
import { validation } from "@/lib/validation";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import bcrypt from "bcrypt";

export async function POST(req) {
    const { username, password } = await req.json();

    const name = username.trim();
    const publicId = getNanoId();

    if (!(name && password)) {
        return NextResponse.json(
            {
                errors: {
                    username: "Username is required",
                    password: "Password is required",
                },
            },
            { status: 400 }
        );
    }

    if (!validation.user.password.regex.test(password)) {
        return NextResponse.json(
            {
                errors: {
                    password: validation.user.password.error,
                },
            },
            { status: 400 }
        );
    }

    if (!validation.user.username.regex.test(name)) {
        return NextResponse.json(
            {
                errors: {
                    username: validation.user.username.error,
                },
            },
            { status: 400 }
        );
    }

    try {
        const exists = await db
            .selectFrom("users")
            .select("id")
            .where(({ or, eb }) => or([eb("username", "=", name), eb("email", "=", name)]))
            .executeTakeFirst();

        if (exists) {
            return NextResponse.json(
                {
                    errors: {
                        username: "Username is already taken",
                    },
                },
                { status: 400 }
            );
        }

        await db
            .insertInto("users")
            .values({
                publicId,
                username: name,
                displayName: name,
                settings: JSON.stringify({
                    showConfetti: true,
                    showResourceOptions: true,
                    notifications: {
                        email: true,
                        push: true,
                    },
                }),
                password: await bcrypt.hash(password, 10),
                tokens: JSON.stringify([]),
            })
            .execute();

        return NextResponse.json(
            {
                message: "User registered successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        db.deleteFrom("users").where("publicId", "=", publicId).execute();
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
