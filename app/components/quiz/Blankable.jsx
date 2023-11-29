"use client";

import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import correctConfetti from "@/lib/correctConfetti";
import { useEffect, useState } from "react";
import { Card, Alert } from "../client";
import { Input, UserInput } from "../client";
import { useModals } from "@/store/store";

export function Blankable({
    canClientCheck,
    quiz,
    handleWhenCorrect,
    isFlashcard,
}) {
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
    
    const addModal = useModals((state) => state.addModal);
    const removeModal = useModals((state) => state.removeModal);

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

            if(response.status === 401) {
                setRequestStatus({
                    success: false,
                    message: "You have been signed out. Please sign in again."
                })
                setShowAlert(true);
                addModal({
                    title: "Sign back in",
                    content: <UserInput onSubmit={removeModal} />,
                });
            } 

            const resJson = await response.json();
            console.log(resJson);
            const message = resJson.message;
            setIncorrectIndexes(message.incorrectIndexes);
            setResponseStatus("complete");
        }
    }

    function handleShowAnswer() {
        if (!isFlashcard) return;
        setShowAnswer((prev) => !prev);
    }

    function inputSize(string) {
        if (string.length < 5) return 5;
        return string.length + 1;
    }

    let label, color, icon;
    if (isFlashcard) {
        label = showAnswer ? "Return to Your Answers" : "Show Correct Answers";
        color = showAnswer ? "var(--accent-tertiary-1)" : undefined;
    } else if (responseStatus === "complete") {
        label = incorrectIndexes.length ? "Incorrect" : "Correct";
        color = incorrectIndexes.length
            ? "var(--accent-secondary-1)"
            : "var(--accent-tertiary-1)";
        icon = incorrectIndexes.length ? faXmark : faCheck;
    } else {
        label = "Check Answer";
    }

    return (
        <Card
            title={"Fill in the blanks"}
            buttons={[
                {
                    label,
                    icon,
                    color,
                    onClick: isFlashcard ? handleShowAnswer : handleCheckAnswer,
                },
            ]}
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
                                value={
                                    isFlashcard && showAnswer
                                        ? quiz.correctResponses[index]
                                        : userResponse[index]
                                }
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
