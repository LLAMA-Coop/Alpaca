import PromptResponse from "./prompt-response";
import { useEffect, useState } from "react";
import styles from "./quizDisplay.module.css";
import MultipleChoice from "./multiple-choice";

// The quiz displays depends on whether it is a client-checked or server-checked quiz component
// If client-checked, everything is rendered from the Quiz object
// If server-checked, only enough data for the prompt is displayed until the response is sent to the server
//  after which, the server provides the remaining data for the Quiz object
// Server-checked is for testing apps that want to prevent cheating

// sent into component via canClientCheck boolean

export default function Quiz({ canClientCheck, quiz }) {
  if (quiz.type === "prompt-response") {
    return (
      <PromptResponse
        canClientCheck={canClientCheck}
        quiz={quiz}
      ></PromptResponse>
    );
  }
  if (quiz.type === "multiple-choice") {
    return (
      <MultipleChoice
        canClientCheck={canClientCheck}
        quiz={quiz}
      ></MultipleChoice>
    );
  }
}
