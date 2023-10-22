import { ResponseCard, ListAnswer } from "@/app/components/client";
import { Blankable } from "./Blankable";
import { memo } from "react";

const sampleQuiz = {
    type: "prompt-response",
    prompt: "This is a sample question. In order for it to be correct, you need to type 'correct answer' into the input.",
    correctResponses: ["correct answer"],
};

export function QuizDisplay({ canClientCheck, quiz }) {
    if (!quiz) {
        quiz = sampleQuiz;
        canClientCheck = true;
    };
    if (quiz.type === "prompt-response" || quiz.type === "multiple-choice") {
        return <ResponseCard canClientCheck={canClientCheck} quiz={quiz} />;
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
            />
        );
    }

    if (quiz.type === "fill-in-the-blank") {
        return <Blankable canClientCheck={canClientCheck} quiz={quiz} />;
    }
}

export default memo(QuizDisplay);
