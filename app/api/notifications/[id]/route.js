import { server, unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import { addError } from "@/lib/db/helpers.js";

export async function POST(req, { params }) {
    const { id } = params;
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const [notifResult, notifFields] = await db
            .promise()
            .query(
                "SELECT `recipientId`, `senderId`, `groupId`, `subject` FROM `Notifications` WHERE `id` = ?",
                [id],
            );

        const notification = notifResult.length > 0 ? notifResult[0] : false;

        if (!notification) {
            console.error("no notification");
            return new NextResponse(
                {
                    message: `The notification ${id} is no longer available. It may have been deleted by the sender.`,
                },
                { status: 404 },
            );
        }

        const { action, message } = await req.json();
        let isUserRecipient = false;
        let isUserSender = false;
        let update;

        if (notification.recipientId === user.id) {
            isUserRecipient = true;
        }
        if (notification.senderId === user.id) {
            isUserSender = true;
        }

        if (action === "Accept") {
            if (!isUserRecipient) {
                return unauthorized;
            }

            const [association, assocFields] = await db
                .promise()
                .query("INSERT INTO `Associates` (`A`, `B`) VALUES (?, ?)", [
                    notification.senderId,
                    notification.recipientId,
                ]);
            update = association;
        }

        if (action === "Decline") {
            update = `The action ${action} is not yet implemented`;
        }

        if (action === "Request") {
            update = `The action ${action} is not yet implemented`;
        }

        if (action === "Join") {
            const [memberResults, memberFields] = await db
                .promise()
                .query(
                    "SELECT `id`, `groupId`, `userId`, `role` FROM `Members` WHERE `groupId` = ? OR `userId` = ? OR `userId` = ?",
                    [
                        notification.groupId,
                        notification.senderId,
                        notification.recipientId,
                    ],
                );
            let sender;
            let recipient;
            memberResults.forEach((x) => {
                if (x.userId === notification.senderId) {
                    sender = x;
                }
                if (x.userId === notification.recipientId) {
                    recipient = x;
                }
            });
            if (
                !sender ||
                (sender.role !== "owner" && sender.role !== "administrator")
            ) {
                return new NextResponse(
                    {
                        message: `The user ID ${notification.senderId} was not authorized to invite you to group ID ${notification.groupId}`,
                    },
                    { status: 401 },
                );
            }

            if (!recipient) {
                const [newMemRes, memFields] = await db
                    .promise()
                    .query(
                        "INSERT INTO `Members` (`groupId`, `userId`, `role`) VALUES (?, ?, 'student')",
                        [notification.groupId, notification.recipientId],
                    );
            }

            update = {
                results,
                newMemRes,
                group: notification.groupId,
                sender: notification.senderId,
                new_member: notification.recipientId,
            };
        }

        if (action === "Invite") {
            update = `The action ${action} is not yet implemented`;
        }

        if (action === "Ignore") {
            update = `The action ${action} is not yet implemented`;
        }

        if (action === "Send Message") {
            update = `The action ${action} is not yet implemented`;
        }

        if (action === "Reply" && message) {
            const [messageResults, messageFields] = await db
                .promise()
                .query(
                    "INSERT INTO `Notifications` (`recipientId`, `senderId`, `groupId`, `type`, `subject`, `message`) VALUES (?, ?, ?, 'message', ?, ?)",
                    [
                        notification.senderId,
                        notification.recipientId,
                        notification.groupId,
                        `Re: ${notification.subject}`,
                        message,
                    ],
                );
            update = messageResults;
        }

        if (action === "Reply" && !message) {
            update = `The action ${action} without a message is not yet implemented`;
        }

        if (action === "Delete") {
            if (!isUserSender && !isUserRecipient) {
                return unauthorized;
            }

            const [deletion, deletionFields] = await db
                .promise()
                .query("DELETE FROM `Notifications` WHERE `id` = ?", [id]);
            update = deletion;
        }

        if (update === undefined) {
            console.error("did not update");
            return new NextResponse(
                {
                    message: `Did not update. The action ${action} is not recognized.`,
                },
                {
                    status: 404,
                },
            );
        } else if (action !== "Delete") {
            const [deletion, deletionFields] = await db
                .promise()
                .query("DELETE FROM `Notifications` WHERE `id` = ?", [id]);
        }

        return new NextResponse(
            {
                message: "Update successful!",
                update,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(`POST error for notification ID ${id}`, error);
        addError(error, "/api/notifications/[id]: POST");
        return server;
    }
}

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const notification = user.notifications.find((x) => x.id == id);
        if (!notification) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The notification could not be found for this user",
                },
                { status: 403 },
            );
        }

        const [deletion, fields] = await db
            .promise()
            .query("DELETE FROM `Notifications` WHERE `id` = ?", [id]);

        if (deletion.affectedRows === 1) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully removed notification.",
                },
                { status: 200 },
            );
        } else if (deletion.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Notification not found.",
                },
                { status: 404 },
            );
        } else if (deletion.affectedRows > 1) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Don't know how, but you deleted more than one notification.",
                },
                { status: 400 },
            );
        }
    } catch (error) {
        console.error("[ERROR] /api/notifications/id:DELETE ", error);
        addError(error, "/api/notifications/[id]: DELETE");
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}

export async function PATCH(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const [update, fields] = await db
            .promise()
            .query("UPDATE `Notifications` SET `isRead` = 1 WHERE `id` = ?", [
                id,
            ]);

        if (update.affectedRows === 1) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully marked notification as read.",
                },
                { status: 200 },
            );
        }
    } catch (error) {
        console.error(error);
        addError(error, "/api/notifications/[id]: PATCH");
    }
}
