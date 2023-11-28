"use client";

import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import correctConfetti from "@/lib/correctConfetti";
import { Card, Input, Alert } from "../client";
import { useEffect, useState } from "react";
import styles from "./Blankable.module.css";

export function ListAnswer({
    canClientCheck,
    quiz,
    isOrdered,
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

    function handleChange(index, value) {
        setResponseStatus("incomplete");
        let array = [...userResponse];
        array[index] = value;
        setUserResponse(array);
    }

    async function handleCheckAnswer() {
        if (canClientCheck) {
            setIncorrectIndexes(
                whichIndexesIncorrect(
                    userResponse,
                    quiz.correctResponses,
                    isOrdered,
                ),
            );
            setResponseStatus("complete");
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
            } 

            const resJson = await response.json();
            console.log(resJson);
            const message = resJson.message;
            setIncorrectIndexes(message.incorrectIndexes);
            setResponseStatus("complete");
        }
    }

    // let color;
    // if(isFlashcard){
    //     color = showAnswer ? "var(--accent-tertiary-1)" : undefined;
    // }

    function handleShowAnswer() {
        if (!isFlashcard) return;
        setShowAnswer((prev) => !prev);
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

            <h4 id="prompt">{quiz.prompt}</h4>
            <ul>
                {userResponse.map((ans, index) => {
                    let status = "";
                    if (incorrectIndexes.includes(index)) {
                        status = styles.incorrect;
                    } else if (responseStatus === "complete") {
                        status = styles.correct;
                    }
                    return (
                        <li key={index} className={status}>
                            <Input
                                type="text"
                                aria-labelledby="prompt"
                                id={"ans_" + index}
                                value={
                                    isFlashcard && showAnswer
                                        ? quiz.correctResponses[index]
                                        : ans
                                }
                                onChange={(e) =>
                                    handleChange(index, e.target.value)
                                }
                                outlineColor={
                                    isFlashcard && showAnswer
                                        ? "var(--accent-tertiary-outline)"
                                        : undefined
                                }
                            ></Input>
                        </li>
                    );
                })}
            </ul>

            {/* <button
                onClick={isFlashcard ? handleShowAnswer : handleCheckAnswer}
                className="button"
                style={{ backgroundColor: color }}
            >
                {isFlashcard && showAnswer
                    ? "Return to Your Answers"
                    : "Show Correct Answers"}
                {!isFlashcard && "Check Answer"}
            </button> */}

            {responseCorrect && responseStatus === "complete" && (
                <div>Correct!</div>
            )}
            {!responseCorrect &&
                responseStatus === "complete" &&
                failures > 2 && (
                    <div data-type="hints">
                        <p>
                            You're having some trouble. Here are some acceptable
                            answers:
                        </p>

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
