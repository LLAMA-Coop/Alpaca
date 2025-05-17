"use client";

import { Dialog, DialogContent, DialogHeading, QuizDisplay, TrainSettings } from "@client";
import hasCommonItem from "@/lib/hasCommonItem";
import { useDailyTrain } from "@/store/store";
import styles from "./DailyTrain.module.css";
import { useState, useEffect } from "react";

export function DailyTrain({ quizzes }) {
    const [showSettings, setShowSettings] = useState(false);
    const [visibleSet, setVisibleSet] = useState(new Array(quizzes.length).fill(true));
    const [tags, setTags] = useState([]);
    const [courses, setCourses] = useState([]);

    const [filteredQuizzes, setFilteredQuizzes] = useState(quizzes);

    const setStart = useDailyTrain((state) => state.setStart);
    const start = useDailyTrain((state) => state.start);
    const isPaused = useDailyTrain((state) => state.isPaused);
    const setIsPaused = useDailyTrain((state) => state.setIsPaused);
    const settings = useDailyTrain((state) => state.settings);

    function handleWhenCorrect(index) {
        const newVisible = [...visibleSet];
        newVisible[index] = false;
        setVisibleSet(newVisible);
    }

    useEffect(() => {
        let presentTags = [];
        let presentCourses = [];
        if (quizzes)
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

    useEffect(() => {
        console.log(settings, filteredQuizzes);
        setFilteredQuizzes(
            quizzes.filter((quiz) => {
                if (settings.tags.length === 0 && settings.courses.length === 0) {
                    return true;
                }
                if (hasCommonItem(settings.tags, quiz.tags)) {
                    return true;
                }
                if (hasCommonItem(settings.courses, quiz.courses)) {
                    return true;
                }
                return false;
            })
        );
    }, [settings]);

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
                    {start ? (isPaused ? "Continue Training" : "Pause Training") : "Start Training"}
                </button>

                <button
                    onClick={() => setShowSettings(true)}
                    className="button"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="currentColor"
                        height="18"
                        width="18"
                    >
                        <g>
                            <path d="M21.359,101.359h58.368c11.52,42.386,55.219,67.408,97.605,55.888c27.223-7.399,48.489-28.665,55.888-55.888h257.472   c11.782,0,21.333-9.551,21.333-21.333s-9.551-21.333-21.333-21.333H233.22C221.7,16.306,178.001-8.716,135.615,2.804   c-27.223,7.399-48.489,28.665-55.888,55.888H21.359c-11.782,0-21.333,9.551-21.333,21.333S9.577,101.359,21.359,101.359z" />
                            <path d="M490.692,234.692h-58.368c-11.497-42.38-55.172-67.416-97.552-55.92c-27.245,7.391-48.529,28.674-55.92,55.92H21.359   c-11.782,0-21.333,9.551-21.333,21.333c0,11.782,9.551,21.333,21.333,21.333h257.493c11.497,42.38,55.172,67.416,97.552,55.92   c27.245-7.391,48.529-28.674,55.92-55.92h58.368c11.782,0,21.333-9.551,21.333-21.333   C512.025,244.243,502.474,234.692,490.692,234.692z" />
                            <path d="M490.692,410.692H233.22c-11.52-42.386-55.219-67.408-97.605-55.888c-27.223,7.399-48.489,28.665-55.888,55.888H21.359   c-11.782,0-21.333,9.551-21.333,21.333c0,11.782,9.551,21.333,21.333,21.333h58.368c11.52,42.386,55.219,67.408,97.605,55.888   c27.223-7.399,48.489-28.665,55.888-55.888h257.472c11.782,0,21.333-9.551,21.333-21.333   C512.025,420.243,502.474,410.692,490.692,410.692z" />
                        </g>
                    </svg>
                </button>
            </div>

            <Dialog
                open={showSettings}
                onOpenChange={() => setShowSettings(false)}
            >
                <DialogContent>
                    <DialogHeading>Settings</DialogHeading>

                    <TrainSettings
                        tags={tags}
                        courses={courses}
                    />
                </DialogContent>
            </Dialog>

            {start && !isPaused && (
                <div className={styles.popup}>
                    {filteredQuizzes.length > 0 && (
                        <ol className="listGrid">
                            {filteredQuizzes.map((quiz, index) => {
                                return (
                                    <li
                                        key={quiz.id}
                                        className={
                                            visibleSet[index] ? styles.showQuiz : styles.hideQuiz
                                        }
                                    >
                                        <QuizDisplay
                                            quiz={quiz}
                                            canClientCheck={false}
                                            handleWhenCorrect={() => handleWhenCorrect(index)}
                                        />
                                    </li>
                                );
                            })}
                        </ol>
                    )}

                    {filteredQuizzes.length === 0 && (
                        <div>
                            You are out of quizzes based on your filter settings. You can adjust the
                            filters to increase available quizzes.
                        </div>
                    )}

                    {filteredQuizzes.length > 0 && visibleSet.every((x) => !x) && (
                        <div>
                            Congratulations! You finished all the available quizzes for today! Keep
                            up the great work.
                        </div>
                    )}

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
                        >
                            <path d="M18 6l-12 12 M6 6l12 12" stroke="black" strokeWidth="4" />
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
