"use client";

import { Input } from "@client";

export function ResponseCard({
  answer,
  setAnswer,
  hasAnswered,
  setHasAnswered,
  isCorrect,
  lighter,
}) {
  return (
    <Input
      type="text"
      value={answer}
      darker={lighter}
      label="Your Response"
      error={hasAnswered && !isCorrect ? "Incorrect" : null}
      disabled={hasAnswered && isCorrect}
      placeholder="Type your response here"
      success={hasAnswered && isCorrect && "- Yay! You got it right!"}
      onChange={(e) => {
        setAnswer(e.target.value);
        setHasAnswered(false);
      }}
    />
  );
}
