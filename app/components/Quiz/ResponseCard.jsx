"use client";

import { Input } from "@client";

export function ResponseCard({
  answers,
  setAnswers,
  hasAnswered,
  setHasAnswered,
  isCorrect,
  lighter,
}) {
  return (
    <Input
      type="text"
      value={answers}
      darker={lighter}
      label="Your Response"
      error={hasAnswered && !isCorrect ? "Incorrect" : null}
      disabled={hasAnswered && isCorrect}
      placeholder="Type your response here"
      success={hasAnswered && isCorrect && "- Yay! You got it right!"}
      onChange={(e) => {
        setAnswers([e.target.value]);
        setHasAnswered(false);
      }}
    />
  );
}
