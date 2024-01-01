import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { Notification } from "@models";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export async function POST(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        await Notification.findOneAndDelete({
            _id: id,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully declined associate request.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[ERROR] /api/associates/id/decline:POST ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
