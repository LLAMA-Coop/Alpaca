"use client";

import { useDailyTrain } from "@/store/store";
import { useEffect, useState } from "react";
import styles from "./Timer.module.css";

export function Timer() {
    const [milliseconds, setMilliseconds] = useState(0);
    const [danger, setDanger] = useState(false);
    const dangerTrigger = 1000 * 30; // 30 seconds

    const start = useDailyTrain((state) => state.start);
    const setStart = useDailyTrain((state) => state.setStart);
    const isPaused = useDailyTrain((state) => state.isPaused);
    const setIsPaused = useDailyTrain((state) => state.setIsPaused);
    const timeLimit = useDailyTrain((state) => state.timeLimit);

    useEffect(() => {
        if (!start) {
            setDanger(false);
            return;
        }

        if (milliseconds === 0) {
            setMilliseconds(timeLimit);
        }

        const interval = setInterval(() => {
            if (isPaused) return;
            setMilliseconds((prev) => prev - 1000);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [start, isPaused]);

    useEffect(() => {
        if (milliseconds <= 0) {
            setMilliseconds(0);
            setStart(false);
            return;
        }

        if (milliseconds <= dangerTrigger) {
            setDanger(true);
        } else {
            setDanger(false);
        }
    }, [milliseconds]);

    if (!start) return null;

    return (
        <div className={styles.container}>
            <p
                className={isPaused && styles.paused}
                style={{ color: danger ? "var(--accent-secondary-1)" : "" }}
            >
                {new Date(milliseconds).toISOString().substr(14, 5)}
            </p>

            <button
                onClick={() => {
                    setIsPaused(!isPaused);
                }}
            >
                {isPaused ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path
                            d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"
                            strokeWidth="0"
                            fill="currentColor"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path
                            d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"
                            strokeWidth="0"
                            fill="currentColor"
                        />
                        <path
                            d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"
                            strokeWidth="0"
                            fill="currentColor"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}
