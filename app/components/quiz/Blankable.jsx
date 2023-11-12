"use client";

import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import correctConfetti from "@/lib/correctConfetti";
import { useEffect, useState } from "react";
import { Card, Alert } from "../client";
import { Input } from "../client";

export function Blankable({ canClientCheck, quiz, handleWhenCorrect }) {
    const [answers, setAnswers] = useState([]);
    const [status, setStatus] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState(false);
    const [failures, setFailures] = useState(0);
    const [incorrectIndexes, setIncorrectIndexes] = useState([]);

    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    useEffect(() => {
        if (status === 0) return;
        if (incorrectIndexes.length === 0) {
            setCorrectAnswer(true);
            setFailures(0);
            correctConfetti();
            handleWhenCorrect();
        } else {
            setFailures(failures + 1);
        }
    }, [incorrectIndexes]);

    function handleInput(index, value) {
        setStatus(1);
        setAnswers((prev) => {
            const newAnswers = [...prev];
            newAnswers[index] = value;
            return newAnswers;
        });
    }

    async function handleCheckAnswer() {
        setStatus(2);
        if (canClientCheck) {
            setIncorrectIndexes(
                whichIndexesIncorrect(userResponse, quiz.correctResponses),
            );
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
                    body: JSON.stringify({ userResponse }),
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
            console.log(resJson);
            const message = resJson.message;
            setIncorrectIndexes(message.incorrectIndexes);
            setStatus("complete");
        }
    }

    function inputSize(string) {
        if (string.length < 5) return 5;
        return string.length + 1;
    }

    const renderPromptWithBlanks = () => {
        const words = quiz.prompt.split(/\b(\w+)\b/g);

        return words.map((word, index) => {
            const isBlankable = quiz.correctResponses
                .map((answer) => answer.split("_")[1])
                .includes(word);

            if (isBlankable) {
                const answer = quiz.correctResponses.find((ans) => {
                    const [answerIndex] = ans.split("_");
                    return index.toString() === answerIndex;
                });

                const answerWord = answer ? answer.split("_")[1] : "";
                return (
                    <Input
                        inline
                        type={"text"}
                        description=""
                        choices={quiz.correctResponses.map(
                            (ans) => ans.split("_")[1],
                        )}
                        value={answers[index] ?? ""}
                        onChange={(e) => handleInput(index, e.target.value)}
                        outlineColor={0}
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
                    label:
                        status === 2
                            ? correctAnswer
                                ? "Correct"
                                : "Incorrect"
                            : "Check Answer",
                    icon:
                        status === 2
                            ? correctAnswer
                                ? faCheck
                                : faXmark
                            : undefined,
                    color:
                        status === 2
                            ? correctAnswer
                                ? "green"
                                : "red"
                            : undefined,
                    onClick: handleCheckAnswer,
                },
            ]}
            border={status === 2 && (correctAnswer ? "green" : "red")}
        >
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />

            {renderPromptWithBlanks()}

            {!correctAnswer && failures > 2 && (
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
