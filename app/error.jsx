"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Error({ error, reset }) {
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        console.error(
            `Error at ${new Date().toISOString()} \n\n${error.stack}`,
        );

        if (process.env.NODE_ENV === "production" && url) {
            fetch(`${basePath}/api/error`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    userInfo: {
                        userAgent: navigator.userAgent,
                        language: navigator.language,
                        cookieEnabled: navigator.cookieEnabled,
                        doNotTrack: navigator.doNotTrack,
                        hardwareConcurrency: navigator.hardwareConcurrency,
                        maxTouchPoints: navigator.maxTouchPoints,
                        isOnline: navigator.onLine,
                    },
                    isClient: true,
                }),
            });
        }
    }, [error]);

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>Something went wrong!</h2>

                <div className={styles.buttons}>
                    <button className="button" onClick={() => reset()}>
                        Try again
                    </button>

                    <button
                        className="button"
                        onClick={() => setShowDetails((prev) => !prev)}
                    >
                        {showDetails ? "Hide" : "Show"} details
                    </button>
                </div>
            </div>

            <div
                className={styles.details}
                style={{ visibility: showDetails ? "visible" : "hidden" }}
            >
                <div>
                    <h2>{error.message}</h2>
                    <p className={styles.paragraph}>{error.stack}</p>
                </div>
            </div>
        </main>
    );
}
