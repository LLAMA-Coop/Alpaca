"use client";

import { QuizDisplay } from "./QuizDisplay";
import { useState, useEffect } from "react";
import { QuizInput } from "./QuizInput";

export function QuizTest() {
    const [quiz, setQuiz] = useState({});

    useEffect(() => {
        setQuiz({
            type: "prompt-response",
            prompt: "What is the capital of France?",
            answers: ["Paris"],
            level: 1,
            numOfAnswers: 1,
            sources: [],
            notes: [],
            courses: [],
            choices: [],
            tags: [],
            hints: [],
            creator: {
                id: 1,
                username: "You",
            },
            createdAt: -1000,
        });
    }, []);

    return (
        <div
            style={{
                gap: "80px",
                display: "flex",
                padding: "24px",
                flexDirection: "column",
                margin: "80px 0 120px 0",
                backgroundColor: "var(--bg-0)",
                borderRadius: "var(--radius-large)",
                border: "1px solid var(--border-color)",
            }}
        >
            <QuizDisplay
                quiz={quiz}
                canClientCheck
            />

            <QuizInput setQuiz={(val) => setQuiz((prev) => ({ ...prev, ...val }))} />
        </div>
    );
}
