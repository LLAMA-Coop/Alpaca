"use client";
import { useStore } from "@/store/store";

export function Notifications() {
    const notifications = useStore((state) => state.notifications);
    console.log(notifications);

    if (notifications.length > 0) {
        return (
            <ol>
                {notifications.map((n, index) => (
                    <li key={n._id ? n._id : index}>
                        <h5>{n.subject}</h5>
                        <div>
                            From:
                            {n.from.user ? (
                                <p>{n.from.user.username}</p>
                            ) : n.from.group ? (
                                <p>
                                    {n.from.admin.username} of Group {n.from.group.name}
                                </p>
                            ) : (
                                <p>{n.from.admin.username}</p>
                            )}
                        </div>
                        <p>{n.message}</p>
                    </li>
                ))}
            </ol>
        );
    } else {
        return <p>No current notifications</p>;
    }
}
