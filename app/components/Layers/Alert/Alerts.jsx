"use client";

import { useEffect, useState } from "react";
import { useAlerts } from "@/store/store";
import styles from "./Alerts.module.css";

export function Alerts() {
    const alerts = useAlerts((state) => state.alerts);

    if (!alerts.length) {
        return null;
    }

    // Edit alerts array to remove duplicates and count the number of times each alert appears
    const alertsMap = alerts.reduce((acc, alert) => {
        const existingAlert = acc.find((a) => a.message === alert.message);

        if (existingAlert) {
            existingAlert.count++;
        } else {
            acc.push({ ...alert, count: 1 });
        }

        return acc;
    }, []);

    return (
        <div className={styles.list}>
            {alertsMap.map((alert) => (
                <Alert
                    alert={alert}
                    key={alert.id}
                />
            ))}
        </div>
    );
}

export function Alert({ alert }) {
    const [animateOut, setAnimateOut] = useState(false);
    const [stopTimeout, setStopTimeout] = useState(false);

    const removeAlert = useAlerts((state) => state.removeAlert);
    const alerts = useAlerts((state) => state.alerts);

    function hideAlert() {
        // If there are multiple alerts with the same message, only remove all same alerts when the last one is hidden
        const sameAlerts = alerts.filter((a) => a.message === alert.message);
        // So, now, only remove all alerts if the current alert is the last one
        if (sameAlerts.length === alert.count) {
            setAnimateOut(true);
            setTimeout(() => {
                // Remove all alerts with the same message
                sameAlerts.forEach((a) => removeAlert(a.id));
            }, 150);
        }

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
                        height="28"
                        width="28"
                    >
                        <path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm-.091,15.419c-.387.387-.896.58-1.407.58s-1.025-.195-1.416-.585l-2.782-2.696,1.393-1.437,2.793,2.707,5.809-5.701,1.404,1.425-5.793,5.707Z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        height="28"
                        width="28"
                    >
                        <path d="M24,12A12,12,0,1,1,12,0,12.013,12.013,0,0,1,24,12ZM13,5H11V15h2Zm0,12H11v2h2Z" />
                    </svg>
                )}
            </div>

            <p style={{ whiteSpace: "pre-wrap" }}>{alert.message}</p>

            {alert.count > 1 && <div>{alert.count}</div>}
        </div>
    );
}
