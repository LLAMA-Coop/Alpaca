import { unauthorized } from "@/lib/apiErrorResponses";
import { User, Notification } from "@models";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export async function POST(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const notification = await Notification.findOne({
            _id: id,
        });

        if (!notification) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No notification found.",
                },
                { status: 404 },
            );
        }

        if (notification.recipient.toString() !== user.id.toString()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not the recipient of this notification.",
                },
                { status: 403 },
            );
        }

        const associate = await User.findOne({
            _id: notification.sender,
        });

        if (!associate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No user found with that username or ID.",
                },
                { status: 404 },
            );
        }

        if (user.associates.includes(associate.id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is already an associate.",
                },
                { status: 400 },
            );
        } else if (user.id === associate.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cannot add yourself as an associate.",
                },
                { status: 400 },
            );
        }

        user.associates.push(associate.id);
        associate.associates.push(user.id);

        await user.save();
        await associate.save();

        await Notification.deleteOne({ _id: notification.id });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully added associate.",
                associate: {
                    id: associate.id,
                    username: associate.username,
                    displayName: associate.displayName,
                    description: associate.description,
                    avatar: associate.avatar,
                    isPublic: associate.isPublic,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[ERROR] /api/associates/id/accept:POST ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
