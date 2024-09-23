"use client";

import { useStore, useAlerts } from "@/store/store";
import styles from "./Notifications.module.css";

export function Notifications() {
    const readNotification = useStore((state) => state.readNotification);
    const notifications = useStore((state) => state.notifications);
    const removeItem = useStore((state) => state.removeItem);
    const addAlert = useAlerts((state) => state.addAlert);
    const addItem = useStore((state) => state.addItem);

    const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? "";

    async function accept(notification) {
        let url = `/api/me/associates/${notification.senderId}`;
        if (notification.type === 2) {
            url = `/api/groups/${notification.group}/members/${notification.recipient}`;
        }

        const response = await fetch(`${basePath}${url}`, {
            method: "POST",
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {}

        if (response.ok) {
            removeItem("notification", notification.id);

            if (data?.content?.associate) {
                addItem("associate", data.content.associate);
            } else if (data?.content?.group) {
                addItem("group", data.content.group);
            }
        }

        addAlert({
            success: response.ok,
            message: data?.message || "Something went wrong",
        });
    }

    async function decline(notification) {
        let url = `/api/me/associates/${notification.id}`;
        if (notification.type === "invite") {
            url = `/api/groups/${notification.groupId}/members/${notification.recipientId}`;
        }

        const response = await fetch(`${basePath}${url}`, {
            method: "DELETE",
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {}

        if (response.ok) {
            removeItem("notification", notification.id);
        }

        addAlert({
            success: response.ok,
            message: data?.message || "Something went wrong",
        });
    }

    async function remove(notification) {
        let url = `/api/notifications/${notification.id}`;

        const response = await fetch(`${basePath}${url}`, {
            method: "DELETE",
        });

        if (response.ok) {
            removeItem("notification", notification.id);
        } else {
            addAlert({
                success: false,
                message: "An error occurred",
            });
        }
    }

    async function read(notification) {
        const url = `/api/notifications/${notification.id}`;

        const response = await fetch(`${basePath}${url}`, {
            method: "PATCH",
        });

        if (response.ok) {
            readNotification(notification.id);
        } else {
            addAlert({
                success: false,
                message: "An error occurred",
            });
        }
    }

    if (notifications.length === 0) return null;

    return (
        <div className={styles.container}>
            <h3>
                Notifications
                <span className={styles.chip}>{notifications.length}</span>
            </h3>

            <ul className="scrollbar">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`${styles.notification} ${
                            n.isRead ? styles.read : ""
                        }`}
                    >
                        <header>
                            <h3>{n.subject}</h3>
                            <p>{n.message}</p>
                        </header>

                        <div className={styles.actions}>
                            <button
                                className="button success"
                                onClick={() => accept(n)}
                            >
                                Accept
                            </button>

                            <button
                                className="button"
                                onClick={() => decline(n)}
                            >
                                Decline
                            </button>
                        </div>

                        <button
                            title="Mark as read"
                            onClick={() => read(n)}
                            className={styles.readButton}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="m23.562,9.059l-12.588,12.622c-.852.852-1.981,1.319-3.183,1.319h-.009c-1.206-.003-2.337-.476-3.187-1.331L.445,17.566c-.589-.582-.595-1.532-.012-2.121.583-.59,1.532-.595,2.122-.012l4.16,4.112c.293.295.67.453,1.073.454h.003c.4,0,.777-.156,1.061-.439l12.587-12.62c.584-.588,1.535-.588,2.121-.003.587.585.588,1.535.003,2.121Zm-18.538,2.708c.786.793,1.834,1.23,2.95,1.233h.009c1.113,0,2.159-.434,2.952-1.226L19.066,3.555c.583-.589.578-1.539-.011-2.122-.589-.582-1.538-.576-2.122.011l-8.126,8.213c-.22.221-.513.342-.825.342h-.002c-.313,0-.606-.123-.813-.332l-3.589-3.711c-.576-.596-1.525-.611-2.121-.035-.595.576-.611,1.525-.035,2.121l3.603,3.724Z" />
                            </svg>
                        </button>

                        <button
                            title="Remove notification"
                            onClick={() => remove(n)}
                            className={styles.removeButton}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M17,4V2a2,2,0,0,0-2-2H9A2,2,0,0,0,7,2V4H2V6H4V21a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V6h2V4ZM11,17H9V11h2Zm4,0H13V11h2ZM15,4H9V2h6Z" />
                            </svg>
                        </button>
                    </div>
                ))}
            </ul>
        </div>
    );
}
