import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { Notification } from "@models";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export async function POST(req, { params }) {
    const { id, memberId } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        await Notification.findOneAndDelete({
            type: 2,
            recipient: memberId,
            group: id,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully declined invitation.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[ERROR] /api/groups/id/members/id/decline:POST ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
