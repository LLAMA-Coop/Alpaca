import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import { addError, getGroup } from "@/lib/db/helpers";

export async function POST(req, { params }) {
    const { id } = params;
    const { userId, username } = await req.json();

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        let member;
        if (userId) {
            const [memberResults, memberFields] = await db
                .promise()
                .query("SELECT `id` FROM `Users` WHERE `id` = ?", [userId]);
            member = memberResults.length > 0 ? memberResults[0] : false;
        }
        if (username) {
            const [memberResults, memberFields] = await db
                .promise()
                .query("SELECT `id` FROM `Users` WHERE `username` = ?", [
                    username,
                ]);
            member = memberResults.length > 0 ? memberResults[0] : false;
        }

        if (!member) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No user found with that username or ID.",
                },
                { status: 404 },
            );
        }

        const group = await getGroup({ id });

        if (!group) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No group found with that ID.",
                },
                { status: 404 },
            );
        }

        const checkMember = group.members.find((x) => x.id === member.id);
        if (checkMember) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is already a member of this group.",
                },
                { status: 400 },
            );
        }

        const [alreadySent, fields] = await db
            .promise()
            .query(
                "SELECT `id` FROM `Notifications` WHERE `type` = 'invite' AND `recipientId` = ? AND `groupId` = ?",
                [member.id, id],
            );

        if (alreadySent.length === 0) {
            const [notification, notifFields] = await db
                .promise()
                .query(
                    `INSERT INTO \`Notifications\` (\`type\`, \`senderId\`, \`recipientId\`, \`groupId\`, \`subject\`, \`message\`) VALUES ('invite', ?, ?, ?, 'Group Invite', 'You have been invited by ${user.username} to join ${group.name}.')`,
                    [user.id, member.id, id],
                );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully invited user to group.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[ERROR] /api/groups/id/members:POST ", error);
        addError(error, "/api/groups/[id]/members: POST");
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
