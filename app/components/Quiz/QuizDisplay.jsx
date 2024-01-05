"use client";

import { ResponseCard, ListAnswer, Blankable } from "@client";
import { Verbatim } from "./Verbatim";
import { memo } from "react";

const sampleQuiz = {
    type: "prompt-response",
    prompt: "This is a sample question. In order for it to be correct, you need to type 'correct answer' into the input.",
    correctResponses: ["correct answer"],
};

export function QuizDisplay({
    canClientCheck = false,
    quiz,
    handleWhenCorrect = () => {},
    isFlashcard = false,
}) {
    if (!quiz) {
        quiz = sampleQuiz;
        canClientCheck = true;
    }
    if (quiz.type === "prompt-response" || quiz.type === "multiple-choice") {
        return (
            <ResponseCard
                canClientCheck={canClientCheck}
                quiz={quiz}
                handleWhenCorrect={handleWhenCorrect}
                isFlashcard={isFlashcard}
            />
        );
    }

    if (
        quiz.type === "unordered-list-answer" ||
        quiz.type === "ordered-list-answer" ||
        quiz.type === "unordered-list"
    ) {
        return (
            <ListAnswer
                canClientCheck={canClientCheck}
                quiz={quiz}
                isOrdered={
                    quiz.type === "ordered-list" ||
                    quiz.type === "ordered-list-answer"
                }
                handleWhenCorrect={handleWhenCorrect}
                isFlashcard={isFlashcard}
            />
        );
    }

    if (quiz.type === "fill-in-the-blank") {
        return (
            <Blankable
                quiz={quiz}
                canClientCheck={canClientCheck}
                handleWhenCorrect={handleWhenCorrect}
                isFlashcard={isFlashcard}
            />
        );
    }

    if (quiz.type === "verbatim") {
        return (
            <Verbatim
                quiz={quiz}
                canClientCheck={canClientCheck}
                handleWhenCorrect={handleWhenCorrect}
                isFlashcard={isFlashcard}
            />
        );
    }
}

export default memo(QuizDisplay);
