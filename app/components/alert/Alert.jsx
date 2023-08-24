"use client";

import { faCheck, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import styles from "./Alert.module.css";

export function Alert({
    show,
    setShow,
    success,
    message,
    timeAlive = 5000,
    placementX = "center",
    placementY = "top",
}) {
    const [animateOut, setAnimateOut] = useState(false);

    useEffect(() => {
        if (!show) return;

        const timer = setTimeout(() => {
            setAnimateOut(true);
            setTimeout(() => {
                setShow(false);
                setAnimateOut(false);
            }, 500);
        }, timeAlive);

        return () => clearTimeout(timer);
    }, [show, timeAlive]);

    if (!show) return null;

    return (
        <div
            aria-live="polite"
            aria-atomic="true"
            aria-relevant="additions"
            aria-label="Alert message"
            aria-describedby="alert"
            aria-hidden={!show}
            className={`${styles.container} ${placementX} ${placementY}`}
            style={{
                backgroundColor: success
                    ? "var(--accent-tertiary-1)"
                    : "var(--accent-secondary-1)",
                animationName: animateOut ? styles.slideOut : "",
            }}
        >
            <div>
                <FontAwesomeIcon icon={success ? faCheck : faClose} />
            </div>

            <div>{message}</div>
        </div>
    );
}
