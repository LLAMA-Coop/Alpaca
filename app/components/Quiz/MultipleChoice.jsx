"use client";

import { Input, InfoBox, Form, Spinner, FormButtons } from "@client";
import { correctConfetti } from "@/lib/correctConfetti";
import { useAlerts, useStore } from "@/store/store";
import styles from "./QuizInput.module.css";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

export function MultipleChoiceCard({ quiz, canClientCheck, setCorrect, lighter }) {
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(false);
    const [failures, setFailures] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [errors, setErrors] = useState({});
    const [hints, setHints] = useState([]);

    const addAlert = useAlerts((state) => state.addAlert);
    const user = useStore((state) => state.user);
    const showConfetti = user.settings?.showConfetti ?? true;

    useEffect(() => {
        setCorrect(isCorrect);
    }, [isCorrect]);

    async function handleSubmitAnswer(e) {
        e.preventDefault();
        if (hasAnswered || !answers.length) return;

        if (quiz.multipleAnswers) {
            if (answers.length !== quiz.numOfAnswers) {
                return setErrors({ answers: `Please select all ${quiz.numOfAnswers} answers` });
            }
        }

        setLoading(true);

        if (canClientCheck) {
            const isCorrect =
                quiz.answers.every((a) => answers.includes(a)) && !!quiz.answers.length;

            if (!isCorrect) {
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
                        body: JSON.stringify({
                            answers: quiz.multipleAnswers ? answers.map((a) => a.value) : [answers],
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to check answer");
                } else {
                    const data = await response.json();
                    if (!data?.content) throw new Error("No data returned");

                    const { isCorrect, hints } = data.content;

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
            {quiz.multipleAnswers ? (
                <Input
                    multiple
                    type="select"
                    data={answers}
                    darker={lighter}
                    label="Your Response"
                    placeholder="Select your answer"
                    disabled={hasAnswered && isCorrect}
                    error={errors.answers ?? (error ? "Incorrect" : null)}
                    success={hasAnswered && isCorrect && "- Yay! You got it right!"}
                    description={`${quiz.numOfAnswers} answers are expected for this question`}
                    options={quiz.choices.map((c) => ({
                        label: c,
                        value: c,
                    }))}
                    setter={(val) => {
                        setErrors({});
                        setAnswers(val);
                        setHasAnswered(false);
                    }}
                />
            ) : (
                <Input
                    type="select"
                    value={answers}
                    darker={lighter}
                    label="Your Response"
                    placeholder="Select your answer"
                    error={error ? "Incorrect" : null}
                    disabled={hasAnswered && isCorrect}
                    success={hasAnswered && isCorrect && "- Yay! You got it right!"}
                    options={quiz.choices.map((c) => ({
                        label: c,
                        value: c,
                    }))}
                    onChange={(val) => {
                        setAnswers(val);
                        setHasAnswered(false);
                    }}
                />
            )}

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
                    disabled={(hasAnswered && !isCorrect) || !answers.length || loading}
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
                            setAnswers([]);
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
