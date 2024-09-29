"use client";

import styles from "./Error.module.css";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? "";

export default function Error({ error, reset }) {
    useEffect(() => {
        if (process.env.NODE_ENV === "production") {
            fetch(`${basePath}/api/error`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    isClient: true,
                    userInfo: {
                        userAgent: navigator.userAgent,
                        language: navigator.language,
                        cookieEnabled: navigator.cookieEnabled,
                        doNotTrack: navigator.doNotTrack,
                        hardwareConcurrency: navigator.hardwareConcurrency,
                        maxTouchPoints: navigator.maxTouchPoints,
                        isOnline: navigator.onLine,
                    },
                }),
            });
        }
    }, [error]);

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1>Something went wrong!</h1>
                <p>Don't worry though, we're on it!</p>

                <div className={styles.buttons}>
                    <button
                        className="button round primary"
                        onClick={() => reset()}
                    >
                        Try again
                    </button>

                    <Link className="button round primary" href="/">
                        Go back home
                    </Link>
                </div>

                <Image
                    src="/assets/error-page.svg"
                    height={400}
                    width={400}
                    alt="Error"
                />
            </section>
        </main>
    );
}
