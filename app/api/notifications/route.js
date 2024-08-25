import { server, unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { getGroup } from "@/lib/db/helpers.js";
import { db } from "@/lib/db/db.js";

export async function POST(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { action, recipientId, groupId, message, subject } =
            await req.json();
        let recipient = await useUser({ id: recipientId });

        if (!recipient) {
            console.error(
                `${user.username} sent a message to user id ${recipientId}, which does not exist`,
            );

            recipient = await useUser({ username: "crash test dummy" });
        }

        const notif = {
            recipientId: recipient.id,
            senderId: user.id,
        };

        if (action === "Request") {
            notif.subject = "A user wants to be your associate";
            notif.message = `A user ${
                user.username === user.displayName
                    ? user.username
                    : `${user.displayName} (${user.username})`
            } is asking to be your associate. This will allow you two to share resources, either to read or to edit. If you accept, they will see your username and display name.`;

            notif.type = "request";
        }

        if (action === "Invite") {
            const group = await getGroup({ id: groupId });

            if (!group) {
                return new NextResponse(
                    { message: `Unable to find group with ID ${groupId}` },
                    { status: 404 },
                );
            }

            const memberStatus = group.members.find((x) => x.id === user.id);

            if (
                memberStatus.role !== "owner" ||
                memberStatus.role !== "administrator"
            ) {
                return new NextResponse(
                    {
                        message: `I'm sorry, but you are not authorized to invite users to group ${group.name}`,
                    },
                    { status: 401 },
                );
            }

            notif.groupId = groupId;
            notif.type = "invite";

            notif.subject = "A group is inviting you to join them!";
            notif.message = `${user.username} is inviting you to join the group ${group.name}. Here's is what the group says about themselves:\n  ${group.description}`;
        }

        if (action === "Send Message") {
            notif.type = "message";
            notif.subject = subject;
            notif.message = message;
        }

        const update = await db.promise.query(
            "INSERT INTO `Notifications` (`recipientId`, `senderId`, `groupId`, `type`, `subject`, `message`) VALUES (?, ?, ?, ?, ?, ?)",
            [
                notif.recipientId,
                notif.senderId,
                notif.groupId,
                notif.type,
                notif.subject,
                notif.message,
            ],
        );

        return new NextResponse(
            {
                message: "Success!",
                update,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error(`POST error for notifications`, error);
        return server;
    }
}

export async function PATCH(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        // Read all notifications
        const res = await db
            .promise()
            .query(
                "UPDATE `Notifications` SET `isRead` = 1 WHERE `recipientId = ?`",
                [user.id],
            );

        return new NextResponse(
            {
                success: res.affectedRows > 0,
                message: `Read ${res.affectedRows ?? "no"} notifications`,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error(`PATCH error for notifications`, error);
        return server;
    }
}
