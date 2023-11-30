"use client";

import { faCheck, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAlerts } from "@/store/store";
import styles from "./Alerts.module.css";
import { useEffect, useState } from "react";

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
                    ? "var(--accent-tertiary-1)"
                    : "var(--accent-secondary-1)",
                animationName: animateOut ? styles.slideOut : "",
            }}
        >
            <div>
                <FontAwesomeIcon icon={alert.success ? faCheck : faClose} />
            </div>

            <div>{alert.message}</div>
        </div>
    );
}
