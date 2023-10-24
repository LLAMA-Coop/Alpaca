import styles from "./notification.module.css";
import { Card } from "../client";

export default function Notification({ notification, handleAction }) {
    let type;
    if (notification.from.user) {
        type = "associate";
    } else if (notification.from.group) {
        type = "group";
    }
    return (
        <Card>
            <h5 className={styles.subject}>{notification.subject}</h5>
            <div>
                From:
                {type === "associate" && (
                    <p>
                        {notification.from.user.username ===
                        notification.from.user.displayName
                            ? `${notification.from.user.username}`
                            : `${notification.from.user.displayName} (${notification.from.user.username})`}
                    </p>
                )}
                {type === "group" && (
                    <p>
                        {notification.from.admin.username ===
                        notification.from.admin.displayName
                            ? `${notification.from.admin.username}`
                            : `${notification.from.admin.displayName} (${notification.from.admin.username})`}
                        <br />
                        of {notification.from.group.name}
                    </p>
                )}
            </div>
            <div className={styles.message}>{notification.message}</div>
            <div>
                How would you like to respond?
                {notification.responseActions &&
                    notification.responseActions.map((res) => {
                        return (
                            <button
                                className={styles.action}
                                key={res}
                                onClick={() => handleAction(res, notification)}
                            >
                                {res}
                            </button>
                        );
                    })}
            </div>
        </Card>
    );
}
