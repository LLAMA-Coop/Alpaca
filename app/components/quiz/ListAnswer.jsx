"use client";

import { useEffect, useState } from "react";
import { Card, Input, Alert } from "../client";
import correctConfetti from "@/lib/correctConfetti";
import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import styles from "./Blankable.module.css";

export function ListAnswer({ canClientCheck, quiz, isOrdered }) {
    const [userResponse, setUserResponse] = useState(
        [...Array(quiz.correctResponses.length)].map(() => ""),
    );
    const [responseStatus, setResponseStatus] = useState("empty");
    const [responseCorrect, setResponseCorrect] = useState(false);
    const [failures, setFailures] = useState(0);
    const [incorrectIndexes, setIncorrectIndexes] = useState([]);

    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    useEffect(() => {
        if (responseStatus === "empty") return;
        if (incorrectIndexes.length === 0) {
            setResponseCorrect(true);
            setFailures(0);
            correctConfetti();
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

    return (
        <Card>
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
                                value={ans}
                                onChange={(e) =>
                                    handleChange(index, e.target.value)
                                }
                            ></Input>
                        </li>
                    );
                })}
            </ul>

            <button onClick={handleCheckAnswer} className="button">
                Check Answer
            </button>

            {responseCorrect && responseStatus === "complete" && (
                <div>Correct!</div>
            )}
            {!responseCorrect &&
                responseStatus === "complete" &&
                failures > 2 && (
                    <div>
                        Incorrect. Acceptable answers are
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
