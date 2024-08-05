import { unauthorized } from "@/lib/apiErrorResponses";
// import { User, Notification } from "@models";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

export async function POST(req) {
    const { userId, username } = await req.json();

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        let isAdded = false;

        let associate = false;
        if (userId) {
            const [associateResult, fields] = await db
                .promise()
                .query(
                    "SELECT `id`, `username`, `displayName`, `description`, `avatar`, `isPublic` FROM `Users` WHERE `id` = ?",
                    [userId],
                );
            associate = associateResult.length > 0 ? associateResult[0] : false;
        }
        if (username) {
            const [associateResult, fields] = await db
                .promise()
                .query(
                    "SELECT `id`, `username`, `displayName`, `description`, `avatar`, `isPublic` FROM `Users` WHERE `username` = ?",
                    [username],
                );
            associate = associateResult.length > 0 ? associateResult[0] : false;
        }

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

            // else if (!associate.isPublic) {
            //     return NextResponse.json(
            //         {
            //             success: false,
            //             message: "User is not public.",
            //         },
            //         { status: 400 },
            //     );
            // }
        } else {
            // Add associate to user and create notification
            const [checkNotifs, fieldsNotifs] = await db
                .promise()
                .query(
                    "SELECT `type`, `recipientId`, `senderId`, `type` FROM `Notifications` WHERE `type` = 'request' AND ((`recipientId` = ? AND `senderId` = ?) OR (`recipientId` = ? AND `senderId` = ?))",
                    [associate.id, user.id, user.id, associate.id],
                );

            // const alreadySent = await Notification.findOne({
            //     type: 1,
            //     recipient: associate.id,
            //     sender: user.id,
            // });

            const alreadySent = checkNotifs.find(
                (x) =>
                    x.recipientId === associate.id && x.sender.id === user.id,
            );

            // const alreadyReceived = await Notification.findOne({
            //     type: 1,
            //     recipient: user.id,
            //     sender: associate.id,
            // });

            const alreadyReceived = checkNotifs.find(
                (x) =>
                    x.recipientId === user.id && x.sender.id === associate.id,
            );

            if (alreadyReceived) {
                // Accept association

                user.associates.push(associate.id);
                associate.associates.push(user.id);

                await user.save();
                await associate.save();

                // await Notification.deleteOne({ _id: alreadyReceived.id });
                await db
                    .promise()
                    .query("DELETE FROM `Notifications` WHERE `id` = ?", [
                        alreadyReceived.id,
                    ]);

                isAdded = true;
            } else if (!alreadySent) {
                // Request association
                // const notification = new Notification({
                //     type: 1,
                //     recipient: associate.id,
                //     sender: user.id,
                //     subject: "Associate Request",
                //     message: `${user.username} has requested to be your associate.`,
                //     responseActions: ["Accept", "Ignore"],
                // });

                // await notification.save();

                await db
                    .promise()
                    .query(
                        "INSERT INTO `Notifications` (`type`, `recipientId`, `senderId`, `subject`, `message`) VALUES (?, ?, ?, ?, ?)",
                        [
                            "request",
                            associate.id,
                            user.id,
                            "Associate Request",
                            `${user.username} has requested to be your associate`,
                        ],
                    );

                // user.notifications.push(notification.id);
                // associate.notifications.push(notification.id);

                // await user.save();
                // await associate.save();
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: isAdded
                    ? "Successfully added associate."
                    : "Request sent successfully.",
                associate: isAdded
                    ? {
                          id: associate.id,
                          username: associate.username,
                          displayName: associate.displayName,
                          description: associate.description,
                          avatar: associate.avatar,
                          isPublic: associate.isPublic,
                      }
                    : null,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[ERROR] /api/associates:POST ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
