"use client";

import { useEffect, useState } from "react";
import { Card, Alert } from "../client";
import correctConfetti from "@/lib/correctConfetti";
import styles from "./Blankable.module.css";
import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";

// need to add server-side check

export function Blankable({ canClientCheck, quiz }) {
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
            const response = await fetch(`/api/quiz/${quiz._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userResponse }),
            });

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
        if (!string) return 1;
        if (string.length < 4) return 1;
        return string.length - 3;
    }

    return (
        <Card>
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />

            <h4 id="prompt">Fill in the blanks</h4>
            {texts.map((text, index) => {
                return (
                    <span key={index}>
                        {text}
                        {index < texts.length - 1 && (
                            <input
                                className={`${styles.input} ${
                                    incorrectIndexes.includes(index)
                                        ? styles.incorrect
                                        : ""
                                }`}
                                type="text"
                                aria-label="blank"
                                id={"ans_" + index}
                                value={userResponse[index]}
                                size={inputSize(String(userResponse[index]))}
                                onChange={(e) => {
                                    handleChange(index, e.target.value);
                                }}
                            />
                        )}
                    </span>
                );
            })}

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
