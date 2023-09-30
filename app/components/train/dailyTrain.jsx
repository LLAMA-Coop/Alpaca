"use client";
import { useState, useEffect } from "react";

export default function DailyTrain() {
    const [seconds, setSeconds] = useState(10);
    const [isRunning, setIsRunning] = useState(false);

    let interval;
    useEffect(() => {
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isRunning]);

    useEffect(() => {
        if (seconds >= 0) return;
        clearInterval(interval);
        setIsRunning(false);
        setSeconds(0);
    }, [seconds]);

    function formatTime(seconds) {
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds,
        ).padStart(2, "0")}`;
    }

    return (
        <>
            <p>Seconds of Training: {formatTime(seconds)}</p>
            <button
                onClick={() => {
                    setIsRunning(!isRunning);
                }}
            >
                {isRunning ? "Pause Training" : "Start Training"}
            </button>
            {isRunning && (
                <ol>
                    <li>This is just a test</li>
                </ol>
            )}
        </>
    );
}
