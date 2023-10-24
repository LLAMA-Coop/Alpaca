import { NextResponse } from "next/server";
import { User, Group } from "@/app/api/models";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";

export async function POST(req) {
    try {
        const sender = await useUser({ token: cookies().get("token")?.value });

        if (!sender) {
            return unauthorized;
        }

        const recipientId = req.nextUrl.pathname.split("/")[3];
        const recipient = await Group.findById(recipientId);
        if (!recipient) {
            console.error(
                `${sender.username} sent a message to group id ${recipientId}, which does not exist`,
            );
        }

        const { action } = await req.json();

        let update;

        if (action === "acceptInvitation" && recipient) {
            if (sender.groups.indexOf(recipient._id) === -1) {
                sender.groups.push(recipient._id);
            }
            if (recipient.users.indexOf(sender._id) === -1) {
                recipient.users.push(sender._id);
            }
            update = {
                user: await sender.save(),
                group: await recipient.save(),
            };
        }

        return NextResponse.json(
            {
                message: `${sender.username} has joined the group ${recipient.name}`,
                update: update,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("POST error for group messages", error);
        return server;
    }
}
