"use client";

import { useEffect, useState } from "react";
import { useAlerts } from "@/store/store";
import styles from "./Alerts.module.css";

export function Alerts() {
    const alerts = useAlerts((state) => state.alerts);

    return (
        <div className={styles.list}>
            {alerts.map((alert) => (
                <Alert key={alert.id} alert={alert} />
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
        setTimeout(() => removeAlert(alert.id), 300);
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
            className={styles.alert}
            onClick={() => hideAlert()}
            onMouseEnter={() => setStopTimeout(true)}
            onMouseLeave={() => setStopTimeout(false)}
            style={{
                backgroundColor: alert.success
                    ? "var(--accent-3)"
                    : "var(--accent-2)",
                animationName: animateOut ? styles.slideOut : "",
            }}
        >
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                    {alert.success ? (
                        <path d="M5 12l5 5l10 -10" />
                    ) : (
                        <g>
                            <path d="M18 6l-12 12" />
                            <path d="M6 6l12 12" />
                        </g>
                    )}
                </svg>
            </div>

            <div style={{ whiteSpace: "pre-wrap" }}>{alert.message}</div>
        </div>
    );
}
