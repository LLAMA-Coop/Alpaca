"use client";
import { useStore } from "@/store/store";
import Notification from "./notification";

export default function Notifications() {
    const notifications = useStore((state) => state.notifications);
    console.log(notifications);

    async function handleAction(action, notification) {
        console.log(action, notification);
        if (action === "ignore") {
            let index = notifications.indexOf(notification);
            notifications.splice(index, 1);
        }
        let directory;
        let recipientId;
        if (action === "accept association") {
            directory = "users";
            recipientId = notification.senderUser._id;
        }
        if (action === "join group") {
            directory = "groups";
            recipientId = notification.senderGroup._id;
        }
        if (action === "delete notification") {
            console.log("sorry to hear that");
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/notifications/${
                notification._id
            }`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action,
                }),
            },
        );
    }

    if (notifications.length > 0) {
        return (
            <ol>
                {notifications.map((n) => {
                    return (
                        <Notification
                            key={n._id}
                            notification={n}
                            handleAction={handleAction}
                        />
                    );
                })}
            </ol>
        );
    } else {
        return <p>No current notifications</p>;
    }
}
