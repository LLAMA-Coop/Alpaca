import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import { addError } from "@/lib/db/helpers";

export async function POST(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const [notificationResult, fields] = await db
            .promise()
            .query("SELECT * from `Notifications` WHERE id = ?", [id]);
        const notification =
            notificationResult.length > 0 ? notificationResult[0] : undefined;

        if (!notification) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No notification found.",
                },
                { status: 404 },
            );
        }

        if (notification.recipientId !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not the recipient of this notification.",
                },
                { status: 403 },
            );
        }

        const [assocResult, fieldsAssoc] = await db
            .promise()
            .query(
                "SELECT `id`, `username`, `displayName`, `description`, `avatar` FROM `Users` WHERE `id` = ?",
                [notification.senderId],
            );

        const associate = assocResult.length > 0 ? assocResult[0] : undefined;

        if (!associate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No user found with that username or ID.",
                },
                { status: 404 },
            );
        }

        if (user.associates.find((x) => x.id === associate.id) != undefined) {
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
        
        await db
            .promise()
            .query("INSERT INTO `Associates` (`A`, `B`) VALUES (?, ?)", [
                user.id,
                associate.id,
            ]);

        await db
            .promise()
            .query("DELETE FROM `Notifications` WHERE `id` = ?", [id]);

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
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[ERROR] /api/associates/id/accept:POST ", error);
        addError(error, '/api/associates/id/accept: POST')
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
