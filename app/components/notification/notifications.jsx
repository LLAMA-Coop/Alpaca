"use client";
import { useStore } from "@/store/store";
import Notification from "./notification";

export default function Notifications() {
    const notifications = useStore((state) => state.notifications);
    const removeNotification = useStore((state) => state.removeNotification);
    console.log(notifications);

    async function handleAction(action, notification) {
        console.log(action, notification);
        if (action === "ignore") {
            removeNotification(notification);
            console.log(notifications)
            // let index = notifications.indexOf(notification);
            // notifications.splice(index, 1);
            // This does not remove the notification from the state
            // You have to do that like you do with useState setters
            return;
        }
        if (action === "accept association") {
        }
        if (action === "join group") {
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
