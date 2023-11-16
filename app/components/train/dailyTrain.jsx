"use client";

import QuizDisplay from "@/app/components/quiz/QuizDisplay";
import { useDailyTrain, useStore } from "@/store/store";
import { UserStats } from "../quiz/UserStats";
import styles from "./DailyTrain.module.css";
import { useState } from "react";

export default function DailyTrain({ quizzes }) {
    const [visibleSet, setVisibleSet] = useState(
        new Array(quizzes.length).fill(true),
    );

    const user = useStore((state) => state.user);
    const userQuizzes = user?.quizzes;

    const setStart = useDailyTrain((state) => state.setStart);
    const start = useDailyTrain((state) => state.start);
    const isPaused = useDailyTrain((state) => state.isPaused);
    const setIsPaused = useDailyTrain((state) => state.setIsPaused);

    function handleWhenCorrect(index) {
        const newVisible = [...visibleSet];
        newVisible[index] = false;
        setVisibleSet(newVisible);
    }

    return (
        <>
            <div className={styles.buttonContainer}>
                <button
                    className="button"
                    onClick={() => {
                        if (start) {
                            setIsPaused(!isPaused);
                        } else {
                            setStart(true);
                        }
                    }}
                >
                    {start
                        ? isPaused
                            ? "Continue Training"
                            : "Pause Training"
                        : "Start Training"}
                </button>

                <button className={styles.settingsButton}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
                        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                    </svg>
                </button>
            </div>

            <div className={styles.popup}></div>

            {start && (
                <ol className="listGrid">
                    {quizzes.map((quiz, index) => {
                        const quizInUser = userQuizzes?.find(
                            (q) => q.quizId === quiz._id,
                        );

                        return (
                            <li
                                key={quiz._id}
                                style={{
                                    display: visibleSet[index]
                                        ? "list-item"
                                        : "none",
                                }}
                            >
                                <QuizDisplay
                                    quiz={quiz}
                                    canClientCheck={false}
                                    handleWhenCorrect={() =>
                                        handleWhenCorrect(index)
                                    }
                                />

                                {quizInUser && (
                                    <UserStats userQuizInfo={quizInUser} />
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
        </>
    );
}
