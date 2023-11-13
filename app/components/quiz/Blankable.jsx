"use client";

import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import correctConfetti from "@/lib/correctConfetti";
import { Card, Alert } from "../client";
import { Input } from "../client";
import { useState } from "react";

export function Blankable({ canClientCheck, quiz, handleWhenCorrect }) {
    const [answers, setAnswers] = useState([]);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [failures, setFailures] = useState(0);
    const [incorrectIndexes, setIncorrectIndexes] = useState([]);

    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    function handleInput(index, value) {
        setHasAnswered(false);
        setAnswers((prev) => {
            const newAnswers = [...prev];
            newAnswers[index] = value;
            return newAnswers;
        });
    }

    async function handleCheckAnswer() {
        if (hasAnswered || answers.length === 0) return;

        setHasAnswered(true);

        if (canClientCheck) {
            const indexes = whichIndexesIncorrect(
                answers,
                quiz.correctResponses,
            );

            if (indexes.length > 0) {
                if (failures > 2) setFailures(0);
                else setFailures((prev) => prev + 1);
            }

            setIncorrectIndexes(indexes);
        } else {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/quiz/${
                    quiz._id
                }`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userResponse: answers,
                    }),
                },
            );

            if (response.status === 401) {
                setRequestStatus({
                    success: false,
                    message: "Please log in and try again",
                });
                setShowAlert(true);
                return;
            }

            const resJson = await response.json();
            const message = resJson.message;

            setIncorrectIndexes(message.incorrectIndexes);
            if (message.incorrectIndexes.length > 0) {
                if (failures > 2) setFailures(0);
                else setFailures((prev) => prev + 1);
            } else {
                setFailures(0);
                correctConfetti();
            }
        }
    }

    function inputSize(string) {
        if (string.length < 5) return 5;
        return string.length + 1;
    }

    const renderPromptWithBlanks = () => {
        const words = quiz.prompt.split(/\b(\w+)\b/g);

        let i = 0;

        return words.map((word) => {
            const isBlankable = quiz.correctResponses
                .map((answer) => answer.split("_")[1])
                .includes(word);

            if (isBlankable) {
                const blankIndex = i;
                i++;

                return (
                    <Input
                        inline
                        type={"text"}
                        description=""
                        choices={quiz.correctResponses.map(
                            (ans) => ans.split("_")[1],
                        )}
                        value={answers[blankIndex] ?? ""}
                        onChange={(e) =>
                            handleInput(blankIndex, e.target.value)
                        }
                        outlineColor={
                            hasAnswered &&
                            (incorrectIndexes.includes(blankIndex)
                                ? "var(--accent-secondary-1)"
                                : "var(--accent-tertiary-1)")
                        }
                    />
                );
            }

            return word;
        });
    };

    return (
        <Card
            title={"Fill in the blanks"}
            buttons={[
                {
                    label: hasAnswered
                        ? incorrectIndexes.length
                            ? "Incorrect"
                            : "Correct"
                        : "Check Answer",
                    icon: hasAnswered
                        ? incorrectIndexes.length
                            ? faXmark
                            : faCheck
                        : undefined,
                    color: hasAnswered
                        ? incorrectIndexes.length
                            ? "var(--accent-secondary-1)"
                            : "var(--accent-tertiary-1)"
                        : undefined,
                    onClick: handleCheckAnswer,
                },
            ]}
            border={
                hasAnswered &&
                (incorrectIndexes.length
                    ? "var(--accent-tertiary-1)"
                    : "var(--accent-secondary-1)")
            }
        >
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />

            {renderPromptWithBlanks()}

            {failures > 2 && (
                <div data-type="hints">
                    <p>
                        You're having some trouble. Here are some acceptable
                        answers:
                    </p>

                    <ul>
                        {quiz.correctResponses.map((ans, index) => {
                            return <li key={index}>{ans.split("_")[1]}</li>;
                        })}
                    </ul>
                </div>
            )}
        </Card>
    );
}
