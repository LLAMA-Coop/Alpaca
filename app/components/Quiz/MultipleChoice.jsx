"use client";

import { Input } from "@client";

export function MultipleChoiceCard({
  quiz,
  answers,
  setAnswers,
  hasAnswered,
  setHasAnswered,
  isCorrect,
  lighter,
}) {
  return (
    <>
      {quiz.multipleAnswers ? (
        <Input
          multiple
          type="select"
          data={answers.map((x) => ({ label: x, value: x }))}
          darker={lighter}
          label="Your Response"
          placeholder="Select your answer"
          disabled={hasAnswered && isCorrect}
          error={hasAnswered && !isCorrect ? "Incorrect" : null}
          success={hasAnswered && isCorrect && "- Yay! You got it right!"}
          description={`${quiz.numOfAnswers} answers are expected for this question`}
          options={quiz.choices.map((c) => ({
            label: c,
            value: c,
          }))}
          setter={(val) => {
            setAnswers(val.map((x) => x.value));
            setHasAnswered(false);
          }}
        />
      ) : (
        <Input
          type="select"
          value={answers}
          darker={lighter}
          label="Your Response"
          placeholder="Select your answer"
          error={hasAnswered && !isCorrect ? "Incorrect" : null}
          disabled={hasAnswered && isCorrect}
          success={hasAnswered && isCorrect && "- Yay! You got it right!"}
          options={quiz.choices.map((c) => ({
            label: c,
            value: c,
          }))}
          onChange={(val) => {
            setAnswers(val);
            setHasAnswered(false);
          }}
        />
      )}
    </>
  );
}
