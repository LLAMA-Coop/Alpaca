import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { Validator } from "@/lib/validation";
import { utapi } from "@/lib/uploadthing.s";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { cookies } from "next/headers";
import { verifyToken } from "node-2fa";
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
        twoFactorCode,
        settings,
    } = await req.json();

    try {
        const user = await useUser({
            token: (await cookies()).get("token")?.value,
            select: [
                "id",
                "password",
                "email",
                "emailCode",
                "avatar",
                "twoFactorEnabled",
                "twoFactorSecret",
            ],
        });

        if (!user) {
            avatar && (await utapi.deleteFiles(avatar));
            return unauthorized;
        }

        if (emailCode && emailCode !== user.emailCode) {
            avatar && (await utapi.deleteFiles(avatar));
            return NextResponse.json(
                {
                    errors: {
                        code: "Invalid email code",
                    },
                },
                { status: 400 }
            );
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
            ].map(([field, value]) => ({ field, value })),
            "user"
        );

        if (username) {
            const exists = await db
                .selectFrom("users")
                .select("id")
                .where(({ eb, or }) =>
                    or([eb("username", "=", username), eb("email", "=", username)])
                )
                .executeTakeFirst();

            if (exists) {
                validator.addError({ field: "username", message: "Username is already taken" });
            }
        }

        if (!validator.isValid) {
            avatar && (await utapi.deleteFiles(avatar));

            return NextResponse.json(
                {
                    message: "Invalid input",
                    errors: validator.errors,
                },
                { status: 400 }
            );
        }

        if (newPassword) {
            if (user.twoFactorEnabled) {
                // If user has two factor enabled, they must provide a two factor code
                // before updating their password.
                const verified = verifyToken(user.twoFactorSecret, twoFactorCode);

                if (!verified) {
                    avatar && (await utapi.deleteFiles(avatar));
                    return NextResponse.json(
                        {
                            errors: {
                                code: "Invalid two factor code",
                            },
                        },
                        { status: 400 }
                    );
                }
            }

            if (!(await bcrypt.compare(password, user.password))) {
                avatar && (await utapi.deleteFiles(avatar));
                return NextResponse.json(
                    {
                        errors: {
                            password: "Invalid password",
                        },
                    },
                    { status: 400 }
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
                    { status: 400 }
                );
            }
        }

        const emailVerificationToken = nanoid(32);

        await db
            .updateTable("users")
            .set({
                password: newPassword ? await bcrypt.hash(newPassword, 10) : undefined,
                username,
                displayName,
                description,
                avatar,
                email,
                emailCode: null,
                emailVerificationToken: email ? emailVerificationToken : undefined,
                emailVerified: typeof email === "string" ? false : undefined,
                settings: settings ? JSON.stringify(settings) : undefined,
            })
            .where("id", "=", user.id)
            .execute();

        if (email) {
            // Send verification email
            const emailId = await sendEmail({
                email,
                type: "email-verify",
                code: emailVerificationToken,
            });

            if (!emailId) {
                avatar && (await utapi.deleteFiles(avatar));
                throw new Error("Failed to send email");
            }
        }

        if (newPassword && user.email) {
            const emailId = await sendEmail({
                email: user.email,
                type: "password-changed",
            });

            if (!emailId) {
                avatar && (await utapi.deleteFiles(avatar));
                throw new Error("Failed to send email");
            }
        }

        if (avatar !== undefined && user.avatar) {
            await utapi.deleteFiles(user.avatar);
        }

        return NextResponse.json(
            {
                message: `Successfully updated user ${email ? "- please verify your email" : ""}`,
            },
            { status: 200 }
        );
    } catch (error) {
        if (avatar) {
            await utapi.deleteFiles(avatar);
        }

        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
