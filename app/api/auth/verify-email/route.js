import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/db/db";
import { nanoid } from "nanoid";

// SEND EMAIL VERIFICATION CODE

export async function POST(req) {
    const { email } = await req.json();

    try {
        const user = await db
            .selectFrom("users")
            .select(["id"])
            .where("email", "=", email)
            .executeTakeFirst();

        if (!user) return unauthorized;

        const emailCode = nanoid(6);

        await db.updateTable("users").set({ emailCode }).where("id", "=", user.id).execute();

        const emailId = await sendEmail({
            email,
            code: emailCode,
            type: "email-code",
        });

        if (!emailId) {
            return NextResponse.json(
                {
                    message: "Failed to send email verification code",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "Successfully sent email verification code",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
