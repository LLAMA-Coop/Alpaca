"use client";

import { Input } from "@client";
import { useState, useEffect } from "react";

export function ListAnswer({
  quiz,
  answers,
  setAnswers,
  hasAnswered,
  setHasAnswered,
  incorrectIndexes,
  setIncorrectIndexes,
  lighter,
}) {
  const [uAns, setUAns] = useState(new Array(quiz.numOfAnswers).fill(""));

  useEffect(() => {
    setUAns((prev) => {
      const newAns = [...prev].map((ans, index) => {
        if (answers[index]) return answers[index];
        return "";
      });
      return newAns;
    });
  }, [answers]);

  return (
    <>
      {uAns.map((ans, index) => {
        const hasError = incorrectIndexes.includes(index);

        return (
          <div key={`answer-${index}`}>
            <Input
              value={ans}
              type="text"
              darker={lighter}
              label={`Answer ${index + 1}`}
              placeholder="Type your answer here"
              disabled={hasAnswered && !hasError}
              error={hasError && "Incorrect answer"}
              success={hasAnswered && !hasError && "- Yay! You got it right!"}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[index] = e.target.value;
                setUAns((prev) => {
                  const newAns = [...prev];
                  newAns[index] = newAnswers[index];
                  return newAns;
                });
                setAnswers(newAnswers);
                setHasAnswered(false);

                if (hasError) {
                  setIncorrectIndexes((prev) =>
                    prev.filter((i) => i !== index)
                  );
                }
              }}
            />
          </div>
        );
      })}
    </>
  );
}
