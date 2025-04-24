import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import {
    canUserWriteToGroup,
    catchRouteError,
    isUserInGroup,
} from "@/lib/db/helpers";

// INVITE USER TO GROUP

export async function POST(req, props) {
    const params = await props.params;
    const { id } = params;
    const { userId, username } = await req.json();

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        if (!(await canUserWriteToGroup(user.id, id))) {
            return unauthorized;
        }

        if (await isUserInGroup(userId, id)) {
            return NextResponse.json(
                {
                    message: "User is already in group",
                },
                { status: 400 },
            );
        }

        const member = await useUser({
            username: username || undefined,
            id: userId || undefined,
        });

        if (!member) {
            return NextResponse.json(
                {
                    message: "User not found",
                },
                { status: 404 },
            );
        }

        const alreadySent = await db
            .selectFrom("notifications")
            .select("id")
            .where("type", "=", "invite")
            .where("recipientId", "=", member.id)
            .where("groupId", "=", id)
            .executeTakeFirst();

        if (!alreadySent) {
            await db
                .insertInto("notifications")
                .values({
                    type: "invite",
                    senderId: user.id,
                    recipientId: member.id,
                    groupId: id,
                    subject: "Group Invite",
                    message: "You have been invited to join a group",
                })
                .execute();

            return NextResponse.json(
                {
                    message: "Successfully invited user to group",
                },
                { status: 200 },
            );
        } else {
            return NextResponse.json(
                {
                    message: "Invite already sent",
                },
                { status: 400 },
            );
        }
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
