import { NextResponse } from "next/server";
// import { User } from "@mneme_app/database-models";
import { User } from "@/app/api/models";
// import User from "@/app/api/models/User";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { serializeOne } from "@/lib/db";
import { Types } from "mongoose";

export async function GET(req) {
    const userId = req.nextUrl.pathname.split("/")[3];

    try {
        const user = serializeOne(
            await useUser({ token: cookies().get("token")?.value }),
        );
        if (
            !user ||
            (user.id !== userId && user.roles.indexOf("admin") === -1)
        ) {
            return unauthorized;
        }

        const content = await User.find();
        return NextResponse.json({
            content,
        });
    } catch (error) {
        console.error(`User [${userId}] GET error: ${error}`);
        return server;
    }
}

export async function POST(req) {
    try {
        const sender = await useUser({ token: cookies().get("token")?.value });

        if (!sender) {
            return unauthorized;
        }

        const recipientId = req.nextUrl.pathname.split("/")[3];
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            console.error(
                `${sender.username} sent a message to user id ${recipientId}, which does not exist`,
            );
        }

        const { action, notificationId } = await req.json();
        const notification = {
            from: {
                user: sender._id,
            },
        };

        let update;

        if (action === "associate") {
            // may want to add a sent array to users for the sender to add the notification id
            notification._id = new Types.ObjectId();
            notification.subject = "A user wants to be your associate!";
            notification.message = `${sender.username} is asking to be your associate. This will allow you two to share resources, either to read or to edit. If you accept, they will see your username and display name.`;
            notification.responseActions = [
                "acceptAssociation",
                "ignore",
                "delete",
            ];

            if (recipient) {
                if (!recipient.notifications) {
                    recipient.notifications = [];
                }
                const alreadyNotified = recipient.notifications.find(
                    (x) => x._id === notification._id,
                );
                if (!alreadyNotified) {
                    recipient.notifications.push(notification);
                }
                // not sure if we need this
                // recipient.markModified("notifications");
                update = await recipient.save();
            }
            if (update.notifications.length === 0) {
                return NextResponse.json(
                    {
                        message: "Did not update",
                    },
                    {
                        status: 500,
                    },
                );
            }
        }

        if (action === "acceptAssociation") {
            // need to also delete notification or replace with confirmation
            if (sender.associates.indexOf(recipient._id) === -1)
                sender.associates.push(recipient._id);
            if (recipient.associates.indexOf(sender._id) === -1)
                recipient.associates.push(sender._id);
            update = {
                sender: await sender.save(),
                recipient: await recipient.save(),
            };
        }

        return NextResponse.json(
            {
                message: "A notification has been sent",
                update: update,
                notifications: update.notifications,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("POST error for messages", error);
        return server;
    }
}
