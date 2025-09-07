"use client";

import { Input } from "@client";
import styles from "./QuizInput.module.css";
import { useState, useEffect } from "react";

export function Verbatim({
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
    <div className={styles.verbatim}>
      {uAns.map((ans, index) => {
        const hasError = incorrectIndexes.includes(index);

        return (
          <Input
            inline
            hideLabel
            value={ans}
            darker={lighter}
            label={`Answer ${index + 1}`}
            disabled={hasAnswered && !hasError}
            key={`quiz-${quiz.id}-answer-${index}`}
            error={hasAnswered && hasError}
            success={hasAnswered && !hasError}
            width={`calc(calc(${uAns[index]?.length + 1}ch) - 4px)`}
            onChange={(e) => {
              const newAnswers = [...uAns];
              newAnswers[index] = e.target.value;
              setUAns((prev) => {
                const newAns = [...prev];
                newAns[index] = newAnswers[index];
                return newAns;
              });
              setAnswers(newAnswers);

              setHasAnswered(false);

              // Remove error for current index
              if (hasError) {
                setIncorrectIndexes(
                  incorrectIndexes.filter((i) => i !== index)
                );
              }
            }}
          />
        );
      })}
    </div>
  );
}
