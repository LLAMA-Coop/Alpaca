import styles from "./Notification.module.css";
import { Card } from "@client";

export function Notification({ notification, handleAction }) {
    let type;
    if (notification.senderUser) {
        type = "associate";
    } else if (notification.senderGroup) {
        type = "group";
    }

    return (
        <Card>
            <h5 className={styles.subject}>{notification.subject}</h5>
            <div>
                From:
                {type === "associate" && (
                    <p>
                        {notification.senderUser.username ===
                        notification.senderUser.displayName
                            ? `${notification.senderUser.username}`
                            : `${notification.senderUser.displayName} (${notification.senderUser.username})`}
                    </p>
                )}
                {type === "group" && (
                    <p>
                        {notification.senderUser.username ===
                        notification.senderUser.displayName
                            ? `${notification.senderUser.username}`
                            : `${notification.senderUser.displayName} (${notification.senderUser.username})`}
                        <br />
                        of {notification.senderGroup.name}
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
