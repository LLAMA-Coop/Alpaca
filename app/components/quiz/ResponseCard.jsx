"use client";

import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Input, Card, Alert } from "@components/client";
import styles from "./ResponseCard.module.css";
import { useState } from "react";
import correctConfetti from "@/lib/correctConfetti";
import shuffleArray from "@/lib/shuffleArray";
import makeUniqueId from "@/lib/uniqueId";

export function ResponseCard({ canClientCheck, quiz }) {
    const [userResponse, setUserResponse] = useState("");
    const [hasAnswered, setHasAnswered] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState(false);
    const [failures, setFailures] = useState(0);
    
    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    const type = quiz.type === "prompt-response" ? "text" : "select";

    function handleInput(e) {
        e.preventDefault();
        setHasAnswered(false);
        setUserResponse(e.target.value);
    }

    async function handleCheckAnswer() {
        if (hasAnswered || !userResponse) return;

        if (canClientCheck) {
            const isCorrect =
                quiz.correctResponses.find(
                    (x) => x.toLowerCase() === userResponse.toLowerCase(),
                ) !== undefined;

            if (isCorrect) {
                setFailures(0);
                correctConfetti();
            } else {
                setFailures(failures + 1);
            }

            setCorrectAnswer(isCorrect);
            setHasAnswered(true);
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
                    message: 'Please log in and try again'
                });
                setShowAlert(true);
                return;
            }

            const resJson = await response.json();
            console.log(resJson);
            const message = resJson.message;
            const isCorrect = message.isCorrect;

            if (isCorrect) {
                setFailures(0);
                correctConfetti();
            } else {
                setFailures(failures + 1);
            }

            setCorrectAnswer(isCorrect);
            setHasAnswered(true);
        }
    }

    const colorsLight = {
        correct: "var(--accent-tertiary-outline)",
        incorrect: "var(--accent-secondary-outline)",
    };

    let colorOverride;
    if (hasAnswered) {
        colorOverride = correctAnswer ? "correct" : "incorrect";
    }

    const choices = quiz.choices
        ? shuffleArray(
              quiz.choices.map((x) => ({
                  label: x,
                  value: x,
                  key: makeUniqueId(),
              })),
          )
        : null;

    return (
        <Card
            title={quiz.prompt}
            buttons={[
                {
                    label: hasAnswered
                        ? correctAnswer
                            ? "Correct"
                            : "Incorrect"
                        : "Check Answer",
                    icon: hasAnswered
                        ? correctAnswer
                            ? faCheck
                            : faXmark
                        : undefined,
                    color: hasAnswered
                        ? correctAnswer
                            ? "green"
                            : "red"
                        : undefined,
                    onClick: handleCheckAnswer,
                },
            ]}
            border={hasAnswered && (correctAnswer ? "green" : "red")}
        >
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />
            
            <Input
                type={type}
                description="Your response to the prompt"
                choices={choices}
                label="Your Response"
                value={userResponse}
                onChange={handleInput}
                onActionTrigger={handleCheckAnswer}
                outlineColor={
                    colorOverride ? colorsLight[colorOverride] : undefined
                }
            />

            {!correctAnswer && failures > 2 && (
                <div className={styles.hints}>
                    <p>You're having some trouble. Here are some hints:</p>
                    <ul>
                        {quiz.correctResponses.map((x, index) => (
                            <li key={index}>{x}</li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
}
