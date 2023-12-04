"use client";

import { useDailyTrain, useModals } from "@/store/store";
import { QuizDisplay, TrainSettings } from "@client";
import hasCommonItem from "@/lib/hasCommonItem";
import styles from "./DailyTrain.module.css";
import { useState, useEffect } from "react";

export function DailyTrain({ quizzes }) {
    const [visibleSet, setVisibleSet] = useState(
        new Array(quizzes.length).fill(true),
    );
    const [tags, setTags] = useState([]);
    const [courses, setCourses] = useState([]);

    const setStart = useDailyTrain((state) => state.setStart);
    const start = useDailyTrain((state) => state.start);
    const isPaused = useDailyTrain((state) => state.isPaused);
    const setIsPaused = useDailyTrain((state) => state.setIsPaused);
    const settings = useDailyTrain((state) => state.settings);

    const addModal = useModals((state) => state.addModal);

    function handleWhenCorrect(index) {
        const newVisible = [...visibleSet];
        newVisible[index] = false;
        setVisibleSet(newVisible);
    }

    useEffect(() => {
        let presentTags = [];
        let presentCourses = [];
        quizzes.forEach((q) => {
            q.tags.forEach((t) => {
                if (!presentTags.includes(t)) {
                    presentTags.push(t);
                }
            });
            q.courses.forEach((c) => {
                if (!presentCourses.includes(c)) {
                    presentCourses.push(c);
                }
            });
        });
        setTags(presentTags);
        setCourses(presentCourses);
    }, []);

    useEffect(() => {
        if (start) {
            document.documentElement.style.overflowY = "hidden";
        } else {
            document.documentElement.style.overflowY = "auto";
        }
    }, [start]);

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

                <button
                    onClick={() =>
                        addModal({
                            title: "Change Settings",
                            content: (
                                <TrainSettings tags={tags} courses={courses} />
                            ),
                        })
                    }
                    className={styles.settingsButton}
                >
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

            {start && !isPaused && (
                <div className={styles.popup}>
                    <ol className="listGrid">
                        {quizzes
                            .filter((quiz) => {
                                if (
                                    settings.tags.length === 0 &&
                                    settings.courses.length === 0
                                ) {
                                    return true;
                                }
                                if (hasCommonItem(settings.tags, quiz.tags)) {
                                    return true;
                                }
                                if (
                                    hasCommonItem(
                                        settings.courses,
                                        quiz.courses,
                                    )
                                ) {
                                    return true;
                                }
                                return false;
                            })
                            .map((quiz, index) => {
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
                                    </li>
                                );
                            })}
                    </ol>

                    <button
                        onClick={() => {
                            setStart(false);
                            setIsPaused(false);
                        }}
                        className={styles.closeButton}
                    >
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
                            <path d="M18 6l-12 12" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {start && isPaused && (
                <div className={styles.blurContainer}>
                    <div>
                        <p>Paused</p>

                        <button
                            className="button"
                            onClick={() => {
                                setIsPaused(false);
                            }}
                        >
                            Resume
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
