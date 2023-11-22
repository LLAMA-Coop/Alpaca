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
                        width="20"
                        height="20"
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
                        height="20px"
                        width="20px"
                        viewBox="0 0 512 512"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g>
                            <path d="M224,435.8V76.1c0-6.7-5.4-12.1-12.2-12.1h-71.6c-6.8,0-12.2,5.4-12.2,12.1v359.7c0,6.7,5.4,12.2,12.2,12.2h71.6   C218.6,448,224,442.6,224,435.8z" />
                            <path d="M371.8,64h-71.6c-6.7,0-12.2,5.4-12.2,12.1v359.7c0,6.7,5.4,12.2,12.2,12.2h71.6c6.7,0,12.2-5.4,12.2-12.2V76.1   C384,69.4,378.6,64,371.8,64z" />
                        </g>
                    </svg>
                )}
            </button>
        </div>
    );
}
