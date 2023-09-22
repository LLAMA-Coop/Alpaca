"use client";

import { useState } from "react";
import { Card, Input } from "../client";
import correctConfetti from "@/lib/correctConfetti";

// need to add server-side check

export function ListAnswer({ canClientCheck, quiz, isOrdered }) {
    const [userResponse, setUserResponse] = useState(
        [...Array(quiz.correctResponses.length)].map(() => ""),
    );
    const [responseStatus, setResponseStatus] = useState("empty");
    const [responseCorrect, setResponseCorrect] = useState(false);
    const [failures, setFailures] = useState(0);

    function handleChange(index, value) {
        setResponseStatus("incomplete");
        let array = [...userResponse];
        array[index] = value;
        setUserResponse(array);
    }

    function handleCheckAnswer() {
        setResponseStatus("complete");
        if (isOrdered) {
            // Easier to find right/wrong if only looking for one wrong
            // But ux better if can clarify which ones wrong
            let isIncorrect = userResponse.find((res, index) => {
                return (
                    res.toLowerCase() !==
                    quiz.correctResponses[index].toLowerCase()
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

        if (!isOrdered) {
            // we could just sort first if unordered, then use same logic for both
            const sortLowerCase = (a, b) => {
                let al = a.toLowerCase();
                let bl = b.toLowerCase();
                if (al < bl) return -1;
                if (al > bl) return 1;
                return 0;
            };
            let userAnswers = userResponse.sort(sortLowerCase);
            let correctAnswers = quiz.correctResponses.sort(sortLowerCase);
            let isIncorrect = userAnswers.find((res, index) => {
                return (
                    res.toLowerCase() !== correctAnswers[index].toLowerCase()
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
    }

    const colorsLight = {
        correct: "var(--accent-tertiary-outline)",
        incorrect: "var(--accent-secondary-outline)",
    };

    let colorOverride;
    if (responseStatus === "complete") {
        colorOverride = responseCorrect ? "correct" : "incorrect";
    }

    return (
        <Card>
            <h4 id="prompt">{quiz.prompt}</h4>
            <ul>
                {quiz.correctResponses.map((ans, index) => {
                    return (
                        <li key={index}>
                            <Input
                                type="text"
                                aria-labelledby="prompt"
                                id={"ans_" + index}
                                value={userResponse[index]}
                                onChange={(e) =>
                                    handleChange(index, e.target.value)
                                }
                                outlineColor={
                                    colorOverride
                                        ? colorsLight[colorOverride]
                                        : undefined
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
                            {quiz.correctResponses.map((ans) => {
                                return <li key={ans}>{ans}</li>;
                            })}
                        </ul>
                    </div>
                )}
        </Card>
    );
}
