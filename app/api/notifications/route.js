import { NextResponse } from "next/server";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { User, Group, Notification } from "@/app/api/models";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const { action, recipientId } = await req.json();
        let recipient = await User.findById(recipientId);

        if (!recipient) {
            console.error(
                `${sender.username} sent a message to user id ${recipientId}, which does not exist`,
            );

            recipient = await User.find({ username: "crash test dummy" });
        }

        const notifPayload = {
            recipient: recipient._id,
            senderUser: user._id,
            responseActions: [],
        };

        if (action === "request association") {
            notifPayload.subject = "A user wants to be your associate";
            notifPayload.message = `A user ${
                user.username === user.displayName
                    ? user.username
                    : `${user.displayName} (${user.username})`
            } is asking to be your associate. This will allow you two to share resources, either to read or to edit. If you accept, they will see your username and display name.`;
            notifPayload.responseActions.push(
                "accept association",
                "delete notification",
                "ignore",
            );
        }

        if (action === "invite to group") {
        }

        if (action === "send message") {
        }

        const notification = new Notification(notifPayload);
        const update = await notification.save();

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
