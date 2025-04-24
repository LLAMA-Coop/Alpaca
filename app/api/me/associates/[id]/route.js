import { catchRouteError, isUserAssociate, isUserBlocked } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// ACCEPT ASSOCIATE REQUEST

export async function POST(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        if (await isUserAssociate(user.id, id)) {
            return NextResponse.json(
                {
                    message: "User is already an associate",
                },
                { status: 400 }
            );
        } else {
            if (await isUserBlocked(user.id, id)) {
                return NextResponse.json(
                    {
                        message: "You can't accept a request from this user",
                    },
                    { status: 400 }
                );
            }

            const received = await db
                .selectFrom("notifications")
                .select("id")
                .where(({ eb, and }) =>
                    and([
                        eb("type", "=", "request"),
                        eb("recipientId", "=", user.id),
                        eb("senderId", "=", id),
                    ])
                )
                .executeTakeFirst();

            if (!received) {
                return NextResponse.json(
                    {
                        message: "No request found",
                    },
                    { status: 404 }
                );
            } else {
                await db
                    .insertInto("associates")
                    .values({
                        A: user.id,
                        B: id,
                    })
                    .execute();

                await db.deleteFrom("notifications").where("id", "=", received.id).execute();

                const associate = await useUser({
                    id,
                    select: ["id", "username", "displayName", "description", "avatar"],
                });

                return NextResponse.json(
                    {
                        message: "Successfully accepted associate request",
                        content: {
                            associate,
                        },
                    },
                    { status: 200 }
                );
            }
        }
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

// DECLINE ASSOCIATE REQUEST OR REMOVE USER FROM ASSOCIATES

export async function DELETE(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const received = await db
            .selectFrom("notifications")
            .select("id")
            .where("recipientId", "=", user.id)
            .where("senderId", "=", id)
            .where("type", "=", "request")
            .executeTakeFirst();

        if (received) {
            await db.deleteFrom("notifications").where("id", "=", received.id).execute();

            return NextResponse.json(
                {
                    message: "Successfully declined request",
                },
                { status: 200 }
            );
        }

        const sent = await db
            .selectFrom("notifications")
            .select("id")
            .where("recipientId", "=", id)
            .where("senderId", "=", user.id)
            .where("type", "=", "request")
            .executeTakeFirst();

        if (sent) {
            await db.deleteFrom("notifications").where("id", "=", sent.id).execute();

            return NextResponse.json(
                {
                    message: "Successfully cancelled request",
                },
                { status: 200 }
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
                    ])
                )
                .execute();

            return NextResponse.json(
                {
                    message: "Successfully removed associate",
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                message: "No request or associate found",
            },
            { status: 404 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
