import { catchRouteError, isUserAssociate, isUserBlocked } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// SEND ASSOCIATE REQUEST TO USER

export async function POST(req) {
    const { userId, username } = await req.json();

    try {
        const user = await useUser({
            token: (await cookies()).get("token")?.value,
            select: ["id", "username"],
        });

        if (!user) return unauthorized;

        if (user.username === username || user.id === userId) {
            return NextResponse.json(
                {
                    message: "Cannot add yourself as an associate",
                },
                { status: 400 }
            );
        }

        if (await isUserBlocked(user.id, userId)) {
            return NextResponse.json(
                {
                    message: "You can't send a request to this user",
                },
                { status: 400 }
            );
        }

        const associate = await useUser({
            id: userId,
            username,
            select: ["id", "username", "displayName", "description", "avatar"],
        });

        if (!associate) {
            return NextResponse.json(
                {
                    message: "No user found with that username or ID",
                },
                { status: 404 }
            );
        }

        if (await isUserAssociate(user.id, associate.id)) {
            return NextResponse.json(
                {
                    message: "User is already an associate",
                },
                { status: 400 }
            );
        } else {
            const alreadyReceived = await db
                .selectFrom("notifications")
                .select(["id", "type", "recipientId", "senderId"])
                .where(({ eb, and }) =>
                    and([
                        eb("type", "=", "request"),
                        eb("recipientId", "=", user.id),
                        eb("senderId", "=", associate.id),
                    ])
                )
                .executeTakeFirst();

            if (alreadyReceived) {
                await db
                    .insertInto("associates")
                    .values({
                        A: user.id,
                        B: associate.id,
                    })
                    .execute();

                await db.deleteFrom("notifications").where("id", "=", alreadyReceived.id).execute();

                return NextResponse.json(
                    {
                        message: "Successfully accepted associate request",
                        content: {
                            associate: associate,
                        },
                    },
                    { status: 200 }
                );
            }

            const alreadySent = await db
                .selectFrom("notifications")
                .select(["id", "type", "recipientId", "senderId"])
                .where(({ eb, and }) =>
                    and([
                        eb("type", "=", "request"),
                        eb("senderId", "=", user.id),
                        eb("recipientId", "=", associate.id),
                    ])
                )
                .executeTakeFirst();

            if (alreadySent) {
                return NextResponse.json(
                    {
                        message: "Request already sent to this user",
                    },
                    { status: 400 }
                );
            } else {
                // If not already sent nor received, send the request
                // as a notification to the recipient

                await db
                    .insertInto("notifications")
                    .values({
                        type: "request",
                        recipientId: associate.id,
                        senderId: user.id,
                        subject: "Associate Request",
                        message: `${user.username} has requested to be your associate`,
                    })
                    .execute();

                return NextResponse.json(
                    {
                        message: "Successfully sent associate request",
                    },
                    { status: 200 }
                );
            }
        }
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
