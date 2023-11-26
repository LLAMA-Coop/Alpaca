"use client";

import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import correctConfetti from "@/lib/correctConfetti";
import { useEffect, useState } from "react";
import { Card, Alert } from "../client";
import { Input } from "../client";

export function Blankable({ canClientCheck, quiz, handleWhenCorrect, isFlashcard }) {
    const [userResponse, setUserResponse] = useState(
        [...Array(quiz.correctResponses.length)].map(() => ""),
    );
    const [responseStatus, setResponseStatus] = useState("empty");
    const [responseCorrect, setResponseCorrect] = useState(false);
    const [failures, setFailures] = useState(0);
    const [incorrectIndexes, setIncorrectIndexes] = useState([]);

    const [showAnswer, setShowAnswer] = useState(false);

    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    useEffect(() => {
        if (responseStatus === "empty") return;
        if (incorrectIndexes.length === 0) {
            setResponseCorrect(true);
            setFailures(0);
            correctConfetti();
            handleWhenCorrect();
        } else {
            setFailures(failures + 1);
        }
    }, [incorrectIndexes]);

    const texts = quiz.prompt.split(/<blank \/>/);

    function handleChange(index, value) {
        setResponseStatus("incomplete");
        let array = [...userResponse];
        array[index] = value;
        setUserResponse(array);
    }

    async function handleCheckAnswer() {
        setResponseStatus("complete");
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
            setResponseStatus("complete");
        }
    }

    function inputSize(string) {
        if (string.length < 5) return 5;
        return string.length + 1;
    }

    return (
        <Card
            title={"Fill in the blanks"}
            buttons={[
                {
                    label:
                        responseStatus === "complete"
                            ? responseCorrect
                                ? "Correct"
                                : "Incorrect"
                            : "Check Answer",
                    icon:
                        responseStatus === "complete"
                            ? responseCorrect
                                ? faCheck
                                : faXmark
                            : undefined,
                    color:
                        responseStatus === "complete"
                            ? responseCorrect
                                ? "green"
                                : "red"
                            : undefined,
                    label:
                        responseStatus === "complete"
                            ? incorrectIndexes.length
                                ? "Incorrect"
                                : "Correct"
                            : "Check Answer",
                    icon:
                        responseStatus === "complete"
                            ? incorrectIndexes.length
                                ? faXmark
                                : faCheck
                            : undefined,
                    color:
                        responseStatus === "complete"
                            ? incorrectIndexes.length
                                ? "var(--accent-secondary-1)"
                                : "var(--accent-tertiary-1)"
                            : undefined,
                    onClick: handleCheckAnswer,
                },
            ]}
            border={
                responseStatus === "complete" &&
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

            {texts.map((text, index) => {
                return (
                    <span key={index}>
                        {text}
                        {index < texts.length - 1 && (
                            <Input
                                inline
                                size={inputSize(String(userResponse[index]))}
                                choices={quiz.correctResponses.map(
                                    (ans) => ans.split("_")[1],
                                )}
                                value={userResponse[index]}
                                onChange={(e) => {
                                    handleChange(index, e.target.value);
                                }}
                                outlineColor={
                                    responseStatus === "complete" &&
                                    (incorrectIndexes.includes(index)
                                        ? "var(--accent-secondary-1)"
                                        : "var(--accent-tertiary-1)")
                                }
                            />
                        )}
                    </span>
                );
            })}

            {!responseCorrect &&
                responseStatus === "complete" &&
                failures > 2 && (
                    <div data-type="hints">
                        <p>You're having some trouble. Here are some hints:</p>
                        <ul>
                            {quiz.correctResponses.map((ans, index) => {
                                return <li key={index}>{ans}</li>;
                            })}
                        </ul>
                    </div>
                )}
        </Card>
    );
}
