"use client";

import { useEffect, useState } from "react";
import { Input, Card } from "../client";
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

    function handleCheckAnswer() {
        setResponseStatus("complete");
        if (canClientCheck || !canClientCheck) {
            setIncorrectIndexes(
                whichIndexesIncorrect(userResponse, quiz.correctResponses),
            );
        }
        // let isIncorrect = userResponse.find((res, index) => {
        //     return (
        //         res.toLocaleLowerCase() !==
        //         quiz.correctResponses[index].toLowerCase()
        //     );
        // });
        // if (isIncorrect == undefined) {
        //     setResponseCorrect(true);
        //     setFailures(0);
        //     correctConfetti();
        // } else {
        //     setFailures(failures + 1);
        // }
    }

    function inputSize(string) {
        if (!string) return 1;
        if (string.length < 4) return 1;
        return string.length - 3;
    }

    return (
        <Card>
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
