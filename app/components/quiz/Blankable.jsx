"use client";

import { useState } from "react";
import { Input, Card } from "../client";
import correctConfetti from "@/lib/correctConfetti";
import styles from "./Blankable.module.css"

// need to add server-side check

export function Blankable({ canClientCheck, quiz }) {
    const [userResponse, setUserResponse] = useState(
        [...Array(quiz.correctResponses.length)].map(() => ""),
    );
    const [responseStatus, setResponseStatus] = useState("empty");
    const [responseCorrect, setResponseCorrect] = useState(false);
    const [failures, setFailures] = useState(0);

    const texts = quiz.prompt.split(/<blank \/>/);

    function handleChange(index, value) {
        setResponseStatus("incomplete");
        let array = [...userResponse];
        array[index] = value;
        setUserResponse(array);
    }

    function handleCheckAnswer() {
        setResponseStatus("complete");
        let isIncorrect = userResponse.find((res, index) => {
            return (
                res.toLocaleLowerCase() !==
                quiz.correctResponses[index].toLocaleLowerCase()
            );
        });
        if (isIncorrect == undefined) {
            setResponseCorrect(true);
            setFailures(0);
            correctConfetti();
        } else {
            setFailures(failures + 1);
        }
    }

    return (
        <Card>
            <h4 id="prompt">Fill in the blanks</h4>
            {texts.map((text, index) => {
                return (
                    <span key={text}>
                        {text}
                        {index < texts.length - 1 && (
                            <input
                                className={styles.input}
                                type="text"
                                aria-label="blank"
                                id={"ans_" + index}
                                value={userResponse[index]}
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
                            {quiz.correctResponses.map((ans) => {
                                return <li key={ans}>{ans}</li>;
                            })}
                        </ul>
                    </div>
                )}
        </Card>
    );
}
