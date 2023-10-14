"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import QuizDisplay from "@/app/components/quiz/QuizDisplay";
import htmlDate from "@/lib/htmlDate";

export default function DailyTrain({ quizzes }) {
    const [seconds, setSeconds] = useState(100);
    const [isRunning, setIsRunning] = useState(false);

    const user = useStore((state) => state.user);
    const userQuizzes = user?.quizzes;
    // const quizzes = useStore((state) => state.quizStore);

    // if (!user) {
    //     setAlertStatus({
    //         success: false,
    //         message: "Please log in",
    //     });
    //     setShowAlert(true);
    // }

    // const quizzes = useStore((state) => {
    //     if (!user) return state.quizStore;
    //     return state.quizStore.filter((q) => {
    //         const quizInUser = userQuizzes.find(
    //             (quiz) => quiz.quizId === q._id,
    //         );
    //         if (!quizInUser) return true;
    //         const hidden = new Date(quizInUser.hiddenUntil);
    //         return hidden.getTime() <= Date.now();
    //     });
    // });
    // console.log(user, quizzes);

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
            <p>Seconds of Training: {formatTime(seconds)}</p>
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
                                <p>
                                    Hidden Until:{" "}
                                    <span>
                                        {htmlDate(
                                            new Date(quizInUser.hiddenUntil),
                                        )}
                                    </span>
                                </p>
                            )}
                        </li>
                    );
                })}
            </ol>
        </>
    );
}
