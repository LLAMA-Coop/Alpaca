"use client";
import { useStore } from "@/store/store";

export function Notifications() {
    const notifications = useStore((state) => state.notifications);
    console.log(notifications);

    async function handleActionResponse(action, notification) {
        console.log(action, notification);
        if (action === "ignore") {
            return;
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

        const response = await fetch(`/api/${directory}/${recipientId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action, notificationId: notification._id }),
        });

        console.log(await response.json());
    }

    if (notifications.length > 0) {
        return (
            <ol>
                {notifications.map((n, index) => {
                    if (n.from.user) {
                        return (
                            <li key={n._id ? n._id : index}>
                                <h5>{n.subject}</h5>
                                <div>
                                    From:
                                    <p>
                                        {n.from.user.username ===
                                        n.from.user.displayName
                                            ? `${n.from.user.username}`
                                            : `${n.from.user.displayName} (${n.from.user.username})`}
                                    </p>
                                </div>
                                <div>
                                    How would you like to respond?
                                    {n.responseActions &&
                                        n.responseActions.map((res) => {
                                            return (
                                                <button
                                                    key={res}
                                                    onClick={() =>
                                                        handleActionResponse(
                                                            res,
                                                            n,
                                                        )
                                                    }
                                                >
                                                    {res}
                                                </button>
                                            );
                                        })}
                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={n._id ? n._id : index}>
                            <h5>{n.subject}</h5>
                            <div>
                                From:
                                {n.from.user ? (
                                    <p>{n.from.user.username}</p>
                                ) : n.from.group ? (
                                    <p>
                                        {n.from.admin.username} of Group{" "}
                                        {n.from.group.name}
                                    </p>
                                ) : (
                                    <p>{n.from.admin.username}</p>
                                )}
                            </div>
                            <p>{n.message}</p>
                        </li>
                    );
                })}
            </ol>
        );
    } else {
        return <p>No current notifications</p>;
    }
}
