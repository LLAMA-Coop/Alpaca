import { unauthorized } from "@/lib/apiErrorResponses";
// import { User, Notification, Group } from "@models";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

export async function POST(req, { params }) {
    const { id, memberId } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        // const notification = await Notification.findOneAndDelete({
        //     type: 2,
        //     recipient: memberId,
        //     group: id,
        // });
        const [notifResult, deleteFields] = await db
            .promise()
            .query(
                "DELETE FROM `Notifications` WHERE `type` = 'invite' AND `recipientId` = ? AND `groupId` = ?",
                [memberId, id],
            );

        if (notifResult.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This user hasn't been invited to this group yet.",
                },
                { status: 404 },
            );
        }

        // const group = await Group.findOne({ _id: id });
        // const member = await User.findOne({ _id: memberId });
        const [memberResults, fields] = await db
            .promise()
            .query(
                "SELECT `Groups`.`id`, `Groups`.`name`, `Groups`.`description`, `Groups`.`isPublic`, `Groups`.`avatar`, EXISTS (SELECT 1 FROM `Users` WHERE `id` = ?) AS `user_exists`, EXISTS (SELECT 1 FROM `Members` WHERE `groupId` = ? AND userId = ?) AS membership_exists FROM `Groups` WHERE `Groups`.`id` = ?",
                [memberId, id, memberId, id],
            );

        const result = memberResults.length > 0 ? memberResults[0] : false;

        if (!result || result.membership_exists) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Data is invalid.",
                },
                { status: 404 },
            );
        } else {
            // group.users.push(member.id);
            // member.groups.push(group.id);

            // await group.save();
            // await member.save();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully joined group.",
                    group: {
                        id: result.id,
                        name: result.name,
                        description: result.description,
                        avatar: result.avatar,
                        isPublic: result.isPublic,
                    },
                },
                { status: 200 },
            );
        }
    } catch (error) {
        console.error("[ERROR] /api/groups/id/members/id/accept:POST ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
