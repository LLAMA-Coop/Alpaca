"use client";

import { Input } from "@client";
import styles from "./QuizInput.module.css";
import { useEffect, useState } from "react";

export function Blankable({
  quiz,
  answers,
  setAnswers,
  hasAnswered,
  setHasAnswered,
  incorrectIndexes,
  setIncorrectIndexes,
  lighter,
}) {
  const texts = quiz.prompt.split(/<blank \/>/);

  const [uAns, setUAns] = useState(new Array(texts.length - 1).fill(""));

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
    <div className={styles.blanks}>
      {texts.map((text, index) => {
        const hasError = incorrectIndexes.includes(index);

        return (
          <span key={index} className={styles.span}>
            {text}
            {index < texts.length - 1 && (
              <Input
                inline
                hideLabel
                value={uAns[index]}
                label={`Blank ${index + 1}`}
                disabled={hasAnswered && !hasError}
                error={hasError}
                success={hasAnswered && !hasError}
                width={`calc(calc(${uAns[index]?.length + 1}ch) - 4px)`}
                darker={lighter}
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

                  // Remove error for current index
                  if (hasError) {
                    setIncorrectIndexes(
                      incorrectIndexes.filter((i) => i !== index)
                    );
                  }
                }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
