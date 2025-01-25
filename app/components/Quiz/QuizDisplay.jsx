"use client";

import { Verbatim } from "./Verbatim";
import { useState } from "react";
import {
    MultipleChoiceCard,
    CardCreatedAt,
    ResponseCard,
    ListAnswer,
    Blankable,
    CardChip,
    Card,
} from "@client";

export function QuizDisplay({ quiz, canClientCheck, isFlashcard, lighter }) {
    const [correct, setCorrect] = useState(false);
    if (isFlashcard) return null;

    return (
        <Card
            fullWidth
            lighter={lighter}
            border={correct && "var(--success)"}
        >
            <header>
                <h4>
                    {quiz.type !== "fill-in-the-blank"
                        ? `${quiz.prompt} ${isFlashcard ? "(Flashcard)" : ""}`
                        : "Fill in the blank"}
                </h4>

                <CardChip>Level {quiz.level}</CardChip>
            </header>

            {(() => {
                if (quiz.type === "prompt-response") {
                    return (
                        <ResponseCard
                            quiz={quiz}
                            lighter={lighter}
                            setCorrect={setCorrect}
                            canClientCheck={canClientCheck}
                        />
                    );
                }

                if (quiz.type === "multiple-choice") {
                    return (
                        <MultipleChoiceCard
                            quiz={quiz}
                            lighter={lighter}
                            setCorrect={setCorrect}
                            canClientCheck={canClientCheck}
                        />
                    );
                }

                if (
                    ["unordered-list-answer", "ordered-list-answer", "unordered-list"].includes(
                        quiz.type
                    )
                ) {
                    return (
                        <ListAnswer
                            quiz={quiz}
                            lighter={lighter}
                            setCorrect={setCorrect}
                            canClientCheck={canClientCheck}
                        />
                    );
                }

                if (quiz.type === "fill-in-the-blank") {
                    return (
                        <Blankable
                            quiz={quiz}
                            lighter={lighter}
                            setCorrect={setCorrect}
                            canClientCheck={canClientCheck}
                        />
                    );
                }

                if (quiz.type === "verbatim") {
                    return (
                        <Verbatim
                            quiz={quiz}
                            lighter={lighter}
                            setCorrect={setCorrect}
                            canClientCheck={canClientCheck}
                        />
                    );
                }
            })()}

            <footer>
                <p title={`Created By ${quiz.creator ? quiz.creator.username : "No one"}`}>
                    Created By {quiz.creator ? quiz.creator.username : "No one"}
                </p>
                <CardCreatedAt>{new Date(quiz.createdAt).toLocaleDateString()}</CardCreatedAt>
            </footer>
        </Card>
    );
}
