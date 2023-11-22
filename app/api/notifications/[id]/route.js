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

        if (!notification) {
            console.error("no notification");
            return new NextResponse(
                {
                    message: `The notification ${notificationId} is no longer available. It may have been deleted by the sender.`,
                },
                { status: 404 },
            );
        }

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
            if (user.associates.indexOf(sender._id) === -1) {
                user.associates.push(sender._id);
                update.recipient = await user.save();
            }
        }

        if (action === "join group") {
            const sender = await User.findById(notification.senderUser);
            const group = await Group.findById(notification.senderGroup);
            if (
                group.owner.toString() !== sender._id.toString() ||
                !group.admins.includes(sender._id)
            ) {
                return new NextResponse(
                    {
                        message: `The user ${sender.username} was not authorized to invite you to group ${group.name}`,
                    },
                    { status: 401 },
                );
            }

            if (group.users.indexOf(user._id) === -1) {
                group.users.push(user._id);
            }
            if (user.groups.indexOf(group._id) === -1) {
                user.groups.push(group._id);
            }
            update = {
                group: await group.save(),
                user: await user.save(),
            };
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
            console.error("did not update");
            return new NextResponse(
                {
                    message: `Did not update. The action ${action} is not recognized.`,
                },
                {
                    status: 404,
                },
            );
        } else {
            await Notification.findByIdAndDelete(notificationId);
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
