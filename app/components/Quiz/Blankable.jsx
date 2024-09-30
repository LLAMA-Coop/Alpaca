"use client";

import { Form, FormButtons, InfoBox, Input, Spinner } from "@client";
import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { correctConfetti } from "@/lib/correctConfetti";
import { useAlerts, useStore } from "@/store/store";
import styles from "./QuizInput.module.css";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

export function Blankable({ canClientCheck, quiz, setCorrect }) {
    const texts = quiz.prompt.split(/<blank \/>/);

    const [answers, setAnswers] = useState(new Array(texts.length - 1).fill(""));
    const [incorrectIndexes, setIncorrectIndexes] = useState([]);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(false);
    const [failures, setFailures] = useState(0);
    const [hints, setHints] = useState([]);

    const addAlert = useAlerts((state) => state.addAlert);
    const user = useStore((state) => state.user);
    const showConfetti = user.settings?.showConfetti ?? true;

    useEffect(() => {
        setCorrect(isCorrect);
    }, [isCorrect]);

    async function handleSubmitAnswer(e) {
        e.preventDefault();
        if (hasAnswered || !answers.every((answer) => answer.length > 0)) return;

        setLoading(true);

        if (canClientCheck) {
            const incorrect = whichIndexesIncorrect(answers, quiz.answers, true);
            const isCorrect = incorrect.length === 0 && !!quiz.answers.length;

            if (!isCorrect) {
                setIncorrectIndexes(incorrect);
                setFailures((prev) => prev + 1);
                setIsCorrect(false);
                setHasAnswered(true);

                const showHints = failures >= 2;

                if (showHints) {
                    setHints(quiz.hints);
                }

                return setLoading(false);
            }

            setHints([]);
            setIsCorrect(true);
            setHasAnswered(true);

            if (showConfetti) {
                correctConfetti();
            }

            return setLoading(false);
        } else {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/quiz/${quiz.id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ answers }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to check answers");
                } else {
                    const data = await response.json();
                    if (!data?.content) throw new Error("No data returned");

                    const { isCorrect, incorrectIndexes, hints } = data.content;

                    setIncorrectIndexes(incorrectIndexes ?? []);
                    setIsCorrect(isCorrect);
                    setHasAnswered(true);
                    setHints(hints);

                    if (!isCorrect) {
                        setFailures((prev) => prev + 1);
                    } else {
                        setHints([]);

                        if (showConfetti) {
                            correctConfetti();
                        }
                    }
                }
            } catch (error) {
                setHasAnswered(false);
                addAlert({
                    success: false,
                    message: error.message,
                });
            } finally {
                setLoading(false);
            }
        }
    }

    const error = hasAnswered && !isCorrect;

    return (
        <Form
            singleColumn
            onSubmit={handleSubmitAnswer}
        >
            <div className={styles.blanks}>
                {texts.map((text, index) => {
                    return (
                        <span
                            key={index}
                            className={styles.span}
                        >
                            {text}
                            {index < texts.length - 1 && (
                                <Input
                                    inline
                                    hideLabel
                                    value={answers[index]}
                                    label={`Blank ${index + 1}`}
                                    disabled={hasAnswered && isCorrect}
                                    width={`calc(${answers[index].length + 1}ch)`}
                                    error={error && incorrectIndexes.includes(index)}
                                    success={hasAnswered && !incorrectIndexes.includes(index)}
                                    onChange={(e) => {
                                        const newAnswers = [...answers];
                                        newAnswers[index] = e.target.value;
                                        setAnswers(newAnswers);

                                        setHasAnswered(false);

                                        // Remove error for current index
                                        if (error && incorrectIndexes.includes(index)) {
                                            setIncorrectIndexes(
                                                incorrectIndexes.filter((i) => i !== index)
                                            );
                                        }
                                    }}
                                />
                            )}
                        </span>
                    );
                })}
            </div>

            {!!hints.length && (
                <InfoBox
                    fullWidth
                    asDiv
                >
                    <h4>Here are some hints to help you out</h4>
                    <ul className={styles.hints}>
                        {hints.map((hint) => (
                            <li key={nanoid()}>{hint}</li>
                        ))}
                    </ul>
                </InfoBox>
            )}

            <FormButtons>
                <button
                    type="submit"
                    disabled={
                        (hasAnswered && isCorrect) || !answers.every((a) => a.length > 0) || loading
                    }
                    className={`button small ${hasAnswered ? (isCorrect ? "success" : "danger") : "primary"}`}
                >
                    {isCorrect ? "Correct!" : hasAnswered ? "Incorrect" : "Check Answer "}{" "}
                    {loading && (
                        <Spinner
                            primary
                            size={14}
                            margin={2}
                        />
                    )}
                </button>

                {hasAnswered && isCorrect && (
                    <button
                        type="button"
                        className="button small border"
                        onClick={() => {
                            setIncorrectIndexes([]);
                            setAnswers(new Array(texts.length - 1).fill(""));
                            setIsCorrect(false);
                            setHasAnswered(false);
                        }}
                    >
                        Try Again
                    </button>
                )}
            </FormButtons>
        </Form>
    );
}
