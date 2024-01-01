import { unauthorized } from "@/lib/apiErrorResponses";
import { User, Notification, Group } from "@models";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export async function POST(req, { params }) {
    const { id, memberId } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const notification = await Notification.findOneAndDelete({
            type: 2,
            recipient: memberId,
            group: id,
        });

        if (!notification) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This user hasn't been invited to this group yet.",
                },
                { status: 404 },
            );
        }

        const group = await Group.findOne({ _id: id });
        const member = await User.findOne({ _id: memberId });

        if (!group || !member || group.users.includes(member.id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Data is invalid.",
                },
                { status: 404 },
            );
        } else {
            group.users.push(member.id);
            member.groups.push(group.id);

            await group.save();
            await member.save();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully joined group.",
                    group: {
                        id: group.id,
                        name: group.name,
                        description: group.description,
                        avatar: group.avatar,
                        isPublic: group.isPublic,
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
