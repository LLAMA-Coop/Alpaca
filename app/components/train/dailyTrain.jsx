"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import QuizDisplay from "@/app/components/quiz/QuizDisplay";
import htmlDate from "@/lib/htmlDate";
import { UserStats } from "../quiz/UserStats";

export default function DailyTrain({ quizzes, timeLimit = 300 }) {
    const [seconds, setSeconds] = useState(timeLimit);
    const [isRunning, setIsRunning] = useState(false);

    const user = useStore((state) => state.user);
    const userQuizzes = user?.quizzes;

    let interval;
    useEffect(() => {
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
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
            <p>Time Limit: {formatTime(seconds)}</p>
            <button
                onClick={() => {
                    setIsRunning(!isRunning);
                }}
            >
                {isRunning ? "Pause Training" : "Start Training"}
            </button>
            <ol style={{ display: isRunning ? "block" : "none" }}>
                {quizzes.map((quiz) => {
                    const quizInUser = userQuizzes?.find(
                        (q) => q.quizId === quiz._id,
                    );

                    return (
                        <li key={quiz._id}>
                            <QuizDisplay canClientCheck={false} quiz={quiz} />
                            {quizInUser && (
                                <UserStats userQuizInfo={quizInUser} />
                            )}
                        </li>
                    );
                })}
            </ol>
        </>
    );
}
