import { NextResponse } from "next/server";
// import { User } from "@mneme_app/database-models";
import { User } from "@/app/api/models";
// import User from "@/app/api/models/User";
import { useUser } from "@/lib/auth";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { serializeOne } from "@/lib/db";

export async function GET(req) {
    const userId = req.nextUrl.pathname.split("/")[3];

    try {
        const user = serializeOne(await useUser());
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
        const sender = await useUser();

        if (!sender) {
            return unauthorized;
        }

        const recipientId = req.nextUrl.pathname.split("/")[3];
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            console.error(
                `${sender.username} sent a message to user id ${recipientId}, which does not exist`,
            );
        } else {
            // console.log("recipient", recipient);
        }

        const { action } = await req.json();
        const notification = {
            from: {
                user: sender._id,
            },
        };

        if (action === "associate") {
            notification.subject = "A user wants to be your associate!";
            notification.message = `${sender.username} is asking to be your associate. This will allow you two to share resources, either to read or to edit. If you accept, they will see your username and display name.`;
        }

        let update;
        if (recipient) {
            if (recipient.notifications) {
                recipient.notifications.push(notification);
            } else {
                recipient.notifications = [];
                recipient.notifications.push(notification);
            }
            recipient.markModified("notifications");
            update = await recipient.save();
            // console.log("Update", update);
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
        } else {
            console.log("updated", update.notifications);
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
