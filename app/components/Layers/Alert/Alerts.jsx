"use client";

import { useEffect, useState } from "react";
import { useAlerts } from "@/store/store";
import styles from "./Alerts.module.css";

export function Alerts() {
    const alerts = useAlerts((state) => state.alerts);

    if (!alerts.length) {
        return null;
    }

    return (
        <div className={styles.list}>
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    alert={alert}
                />
            ))}
        </div>
    );
}

export function Alert({ alert }) {
    const [animateOut, setAnimateOut] = useState(false);
    const [stopTimeout, setStopTimeout] = useState(false);

    const removeAlert = useAlerts((state) => state.removeAlert);

    function hideAlert() {
        setAnimateOut(true);
        setTimeout(() => removeAlert(alert.id), 150);
    }

    useEffect(() => {
        let timeout;

        if (!stopTimeout) {
            timeout = setTimeout(() => {
                hideAlert();
            }, 5000);
        }

        return () => clearTimeout(timeout);
    }, [stopTimeout]);

    return (
        <div
            aria-live="polite"
            aria-atomic="true"
            aria-relevant="additions"
            aria-label="Alert message"
            aria-describedby="alert"
            className={`${styles.alert} ${alert.success ? styles.success : ""} ${!alert.success ? styles.danger : ""} ${alert.warning ? styles.warning : ""}`}
            onMouseEnter={() => setStopTimeout(true)}
            onMouseLeave={() => setStopTimeout(false)}
            onClick={() => hideAlert()}
            style={{
                backgroundColor: alert.success ? "var(--success)" : "var(--danger)",
                animationName: animateOut ? styles.popOut : "",
                opacity: animateOut ? 0 : "",
            }}
        >
            <div className={styles.icon}>
                {alert.success ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        height="24"
                        width="24"
                    >
                        <path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm-.091,15.419c-.387.387-.896.58-1.407.58s-1.025-.195-1.416-.585l-2.782-2.696,1.393-1.437,2.793,2.707,5.809-5.701,1.404,1.425-5.793,5.707Z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        height="24"
                        width="24"
                    >
                        <path d="M24,12A12,12,0,1,1,12,0,12.013,12.013,0,0,1,24,12ZM13,5H11V15h2Zm0,12H11v2h2Z" />
                    </svg>
                )}
            </div>

            <p style={{ whiteSpace: "pre-wrap" }}>{alert.message}</p>
        </div>
    );
}
