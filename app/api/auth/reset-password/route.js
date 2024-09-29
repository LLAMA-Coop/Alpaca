import { catchRouteError } from "@/lib/db/helpers";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import bcrypt from "bcrypt";

export async function POST(req) {
    const { resetToken, password } = await req.json();

    const validator = new Validator();

    if (
        !validator.validate({
            field: "password",
            value: password,
            type: "user",
        })
    ) {
        return NextResponse.json(
            {
                message: "Invalid password format",
            },
            { status: 400 }
        );
    }

    try {
        const user = await db
            .selectFrom("users")
            .select("id")
            .where("passwordReset", "=", resetToken)
            .executeTakeFirst();

        if (!user) {
            return NextResponse.json(
                {
                    message: "Invalid token",
                },
                { status: 400 }
            );
        }

        if (user.passwordResetExpiration < Date.now()) {
            return NextResponse.json(
                {
                    message: "Token expired - please request another",
                },
                { status: 400 }
            );
        }

        await db
            .updateTable("users")
            .set({
                password: await bcrypt.hash(password, 10),
                passwordReset: null,
                passwordResetExpiration: null,
            })
            .where("id", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                message: "Successfully reset password",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
