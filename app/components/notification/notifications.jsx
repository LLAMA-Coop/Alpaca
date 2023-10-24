"use client";
import { useStore } from "@/store/store";
import Notification from "./notification";

export default function Notifications() {
    const notifications = useStore((state) => state.notifications);
    console.log(notifications)

    async function handleAction(action, notification) {
        console.log(action, notification);
        if (action === "ignore") {
            let index = notifications.indexOf(notification);
            notifications.splice(index, 1);
        }
        let directory;
        let recipientId;
        if (action === "acceptAssociation") {
            directory = "users";
            recipientId = notification.from.user._id;
        }
        if (action === "join") {
            directory = "groups";
            recipientId = notification.from.group._id;
        }
        if (action === "delete") {
            console.log("sorry to hear that");
            return;
        }

        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_BASEPATH ?? ""
            }/api/${directory}/${recipientId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action,
                    notificationId: notification._id,
                }),
            },
        );

        console.log(await response.json());
    }

    if (notifications.length > 0) {
        return (
            <ol>
                {notifications.map((n) => {
                    return <Notification notification={n} handleAction={handleAction} />
                })}
            </ol>
        );
    } else {
        return <p>No current notifications</p>;
    }
}
