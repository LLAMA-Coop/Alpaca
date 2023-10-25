import { NextResponse } from "next/server";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { User, Group } from "@/app/api/models";
import Notification from "../../models/Notification";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
    const notificationId = req.nextUrl.pathname.split("/")[3];
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const notification = await Notification.findById(notificationId);

        const { action } = await req.json();
        let isUserRecipient = false;
        let isUserSender = false;
        let update;

        if (notification.recipient._id.toString() === user._id.toString()) {
            isUserRecipient = true;
        }
        if (notification.senderUser._id.toString() === user._id.toString()) {
            isUserSender = true;
        }

        if (action === "accept association") {
            if (!isUserRecipient) {
                return unauthorized;
            }
            const sender = await User.findById(notification.senderUser);
            update = {};
            if (sender.associates.indexOf(user._id) === -1) {
                sender.associates.push(user.id);
                update.sender = await sender.save();
            }
            if (user.associates.indexOf(sender._id) === -l) {
                user.associates.push(sender._id);
                update.recipient = await user.save();
            }
        }

        if (action === "join group") {
        }

        if (action === "reply") {
        }

        if (action === "delete notification") {
            if (!isUserSender && !isUserRecipient) {
                return unauthorized;
            }
            update = await Notification.findByIdAndDelete(notificationId);
        }

        if (update === undefined) {
            return new NextResponse(
                {
                    message: `Did not update. The action ${action} is not recognized.`,
                },
                {
                    status: 404,
                },
            );
        }

        return new NextResponse(
            {
                message: "Update successful!",
                update,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(
            `POST error for notification ID ${notificationId}`,
            error,
        );
        return server;
    }
}
