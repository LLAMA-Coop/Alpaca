import { catchRouteError, doesUserExist } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { utapi } from "@/lib/uploadthing.s";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

// UPDATE USER

export async function PATCH(req) {
    const {
        password,
        newPassword,
        username,
        displayName,
        description,
        avatar,
        email,
        emailCode,
    } = await req.json();

    try {
        const user = await useUser({
            token: cookies().get("token")?.value,
            select: ["id", "password", "email", "emailCode", "avatar"],
        });

        if (!user) {
            avatar && (await utapi.deleteFiles(avatar));
            return unauthorized;
        }

        const validator = new Validator();

        validator.validateAll(
            [
                ["password", newPassword],
                ["username", username],
                ["displayName", displayName],
                ["description", description],
                ["avatar", avatar],
                ["email", email],
                ["emailCode", emailCode],
            ].map(([field, value]) => ({ field, value })),
            "user",
        );

        if (username) {
            if (await doesUserExist(username)) {
                validator.addError("username", "Username is already taken");
            }
        }

        if (!validator.isValid) {
            avatar && (await utapi.deleteFiles(avatar));

            return NextResponse.json(
                {
                    message: "Invalid input",
                    errors: validator.errors,
                },
                { status: 400 },
            );
        }

        if (newPassword) {
            if (!(await bcrypt.compare(password, user.password))) {
                avatar && (await utapi.deleteFiles(avatar));
                return NextResponse.json(
                    {
                        errors: {
                            password: "Invalid password",
                        },
                    },
                    { status: 400 },
                );
            }
        }

        if (email) {
            const exists = await db
                .selectFrom("users")
                .select("id")
                .where("email", "=", email)
                .executeTakeFirst();

            if (exists) {
                avatar && (await utapi.deleteFiles(avatar));
                return NextResponse.json(
                    {
                        errors: {
                            email: "Email is already taken",
                        },
                    },
                    { status: 400 },
                );
            }

            // User already has an email, so we need to verify the current email
            // before updating it.
            if (user.email && emailCode !== user.emailCode) {
                avatar && (await utapi.deleteFiles(avatar));
                return NextResponse.json(
                    {
                        message: "Invalid email code",
                    },
                    { status: 400 },
                );
            }
        }

        const emailVerificationToken = nanoid(32);

        if (email) {
            // Send verification email
            await sendEmail({
                email,
                code: emailVerificationToken,
                type: "verify",
            });
        }

        await db
            .updateTable("users")
            .set({
                password: newPassword
                    ? await bcrypt.hash(newPassword, 10)
                    : undefined,
                username,
                displayName,
                description,
                avatar,
                email,
                emailCode: null,
                emailVerificationToken: email
                    ? emailVerificationToken
                    : undefined,
                emailVerified: email ? false : undefined,
            })
            .where("id", "=", user.id)
            .execute();

        if (avatar && user.avatar) {
            await utapi.deleteFiles(user.avatar);
        }

        return NextResponse.json(
            {
                message: `Successfully updated user ${email ? "- please verify your email" : ""}`,
            },
            { status: 200 },
        );
    } catch (error) {
        if (avatar) {
            await utapi.deleteFiles(avatar);
        }

        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
