import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/db/db";
import { nanoid } from "nanoid";

export async function POST(req) {
    const { email } = await req.json();

    try {
        const user = await db
            .selectFrom("users")
            .select("id")
            .where("email", "=", email)
            .executeTakeFirst();

        if (!user) {
            // We don't want to reveal that the email doesn't exist
            return NextResponse.json(
                {
                    message: "Successfully sent password reset email",
                },
                { status: 200 }
            );
        }

        const token = nanoid(32);

        await db
            .updateTable("users")
            .set({
                passwordReset: token,
                // 1 hour expiration (needs to be TIMESTAMT)
                passwordResetExpiration: new Date(Date.now() + 3600000)
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " "),
            })
            .where("id", "=", user.id)
            .execute();

        const emailId = await sendEmail({
            email,
            code: token,
            type: "password-reset",
        });

        if (!emailId) {
            throw new Error("Failed to send email");
        }

        return NextResponse.json(
            {
                message: "Successfully sent password reset email",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
