import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { verifyToken } from "node-2fa";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { sendEmail } from "@/lib/email";
import { nanoid } from "nanoid";

export async function POST(req) {
    try {
        const user = await useUser({
            token: (await cookies()).get("token")?.value,
            select: ["id", "emailVerified", "email", "emailVerificationToken"],
        });

        if (!user) return unauthorized;

        if (!user.email) {
            return NextResponse.json(
                {
                    message: "You must have an email address to verify it",
                },
                { status: 400 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                {
                    message: "Your email is already verified",
                },
                { status: 400 }
            );
        }

        let code = user.emailVerificationToken;
        if (!code) code = nanoid(32);

        if (!user.emailVerificationToken) {
            await db
                .updateTable("users")
                .set({
                    emailVerificationToken: code,
                })
                .where("id", "=", user.id)
                .execute();
        }

        const emailId = await sendEmail({
            code,
            email: user.email,
            type: "email-verify",
        });

        if (!emailId) {
            throw new Error("Failed to send email");
        }

        return NextResponse.json(
            {
                message: "A verification email has been sent to your email address",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
