import { catchRouteError, isUserBlocked } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req, props) {
    const params = await props.params;
    const { id } = params;

    const { title, message } = await req.json();

    const validator = new Validator();

    validator.validateAll(
        [
            ["title", title],
            ["message", message],
        ].map(([field, value]) => ({ field, value })),
        "message"
    );

    if (!validator.isValid) {
        return NextResponse.json(
            {
                message: "Invalid message data",
                errors: validator.errors,
            },
            { status: 400 }
        );
    }

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value || "" });
        if (!user) return unauthorized;

        if (id === user.id) {
            return NextResponse.json(
                {
                    message: "You can't send a message to yourself",
                },
                { status: 400 }
            );
        }

        if (await isUserBlocked(user.id, id)) {
            return NextResponse.json(
                {
                    message: "You can't send a message to this user",
                },
                { status: 400 }
            );
        }

        const recipient = await useUser({ id });

        if (!recipient) {
            return NextResponse.json(
                {
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        await db
            .insertInto("notifications")
            .values({
                type: "message",
                senderId: user.id,
                recipientId: recipient.id,
                subject: title.trim() || "New message",
                message: message.trim(),
            })
            .execute();

        return NextResponse.json(
            {
                message: "Successfully messaged user",
            },
            { status: 201 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
