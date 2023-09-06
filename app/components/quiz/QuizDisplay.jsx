import { ResponseCard, ListAnswer } from "@/app/components/client";

// The quiz displays depends on whether it is a client-checked or server-checked quiz component
// If client-checked, everything is rendered from the Quiz object
// If server-checked, only enough data for the prompt is displayed until the response is sent to the server
//  after which, the server provides the remaining data for the Quiz object
// Server-checked is for testing apps that want to prevent cheating

// sent into component via canClientCheck boolean

export function QuizDisplay({ canClientCheck, quiz }) {
    if (quiz.type === "prompt-response" || quiz.type === "multiple-choice") {
        return <ResponseCard canClientCheck={canClientCheck} quiz={quiz} />;
    }

    if (quiz.type === "unordered-list-answer" || quiz.type === "ordered-list-answer" || quiz.type === "unordered-list") {
        return (
            <ListAnswer
                canClientCheck={canClientCheck}
                quiz={quiz}
                isOrdered={quiz.type === "ordered-list"}
            />
        );
    }
}
