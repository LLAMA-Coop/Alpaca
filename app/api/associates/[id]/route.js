import { catchRouteError, isUserAssociate } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const received = await db
            .selectFrom("notifications")
            .where("recipientId", "=", user.id)
            .where("senderId", "=", id)
            .where("type", "=", "request")
            .executeTakeFirst();

        if (received) {
            await db
                .deleteFrom("notifications")
                .where("id", "=", received.id)
                .execute();

            return NextResponse.json(
                {
                    message: "Successfully removed request.",
                },
                { status: 200 },
            );
        }

        const sent = await db
            .selectFrom("notifications")
            .where("recipientId", "=", id)
            .where("senderId", "=", user.id)
            .where("type", "=", "request")
            .executeTakeFirst();

        if (sent) {
            await db
                .deleteFrom("notifications")
                .where("id", "=", sent.id)
                .execute();

            return NextResponse.json(
                {
                    message: "Successfully removed request.",
                },
                { status: 200 },
            );
        }

        const isAssociate = await isUserAssociate(user.id, id);

        if (isAssociate) {
            await db
                .deleteFrom("associates")
                .where(({ eb, or, and }) =>
                    or([
                        and([eb("A", "=", user.id), eb("B", "=", id)]),
                        and([eb("A", "=", id), eb("B", "=", user.id)]),
                    ]),
                )
                .execute();

            return NextResponse.json(
                {
                    message: "Successfully removed associate.",
                },
                { status: 200 },
            );
        }

        return NextResponse.json(
            {
                message: "No request or associate found.",
            },
            { status: 404 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
