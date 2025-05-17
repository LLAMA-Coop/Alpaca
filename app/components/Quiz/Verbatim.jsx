"use client";

import { Input, Form, InfoBox, FormButtons, Spinner } from "@client";
import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { correctConfetti } from "@/lib/correctConfetti";
import { useStore, useAlerts } from "@/store/store";
import styles from "./QuizInput.module.css";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

export function Verbatim({
  quiz,
  lighter,
  setCorrect,
  canClientCheck,
  isFlashcard,
}) {
  const [answers, setAnswers] = useState(new Array(quiz.numOfAnswers).fill(""));
  const [incorrectIndexes, setIncorrectIndexes] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failures, setFailures] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [hints, setHints] = useState([]);

  const addAlert = useAlerts((state) => state.addAlert);
  const user = useStore((state) => state.user);
  const showConfetti =
    (user && user.settings && user.settings.showConfetti) ?? true;

  useEffect(() => {
    setCorrect(isCorrect);
  }, [isCorrect]);

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    if (
      (hasAnswered || !answers.every((answer) => answer.length > 0)) &&
      !isFlashcard
    )
      return;

    setLoading(true);

    if (canClientCheck) {
      const incorrect = whichIndexesIncorrect(answers, quiz.answers, true);
      const isCorrect = incorrect.length === 0 && !!quiz.answers.length;

      setReveal(true);

      if (!isCorrect) {
        setIncorrectIndexes(incorrect);
        setFailures((prev) => prev + 1);
        setIsCorrect(false);
        setHasAnswered(true);

        const showHints = failures >= 2;

        if (showHints) {
          setHints(quiz.hints);
        }

        return setLoading(false);
      }

      setHints([]);
      setIsCorrect(true);
      setHasAnswered(true);

      if (showConfetti) {
        correctConfetti();
      }

      return setLoading(false);
    } else {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/quiz/${quiz.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ answers }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check answers");
        } else {
          const data = await response.json();
          if (!data?.content) throw new Error("No data returned");

          const { isCorrect, incorrectIndexes, hints } = data.content;

          setIncorrectIndexes(incorrectIndexes ?? []);
          setIsCorrect(isCorrect);
          setHasAnswered(true);
          setHints(hints);

          if (!isCorrect) {
            setFailures((prev) => prev + 1);
          } else {
            setHints([]);

            if (showConfetti) {
              correctConfetti();
            }
          }
        }
      } catch (error) {
        setHasAnswered(false);
        addAlert({
          success: false,
          message: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  }

  const error = hasAnswered && !isCorrect;

  return (
    <Form singleColumn onSubmit={handleSubmitAnswer}>
      <div className={styles.verbatim}>
        {answers.map((a, index) => (
          <Input
            inline
            hideLabel
            value={a}
            darker={lighter}
            label={`Answer ${index + 1}`}
            disabled={hasAnswered && isCorrect}
            key={`quiz-${quiz.id}-answer-${index}`}
            error={error && incorrectIndexes.includes(index)}
            success={hasAnswered && !incorrectIndexes.includes(index)}
            width={`calc(calc(${answers[index]?.length + 1}ch) - 4px)`}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[index] = e.target.value;
              setAnswers(newAnswers);

              setHasAnswered(false);

              // Remove error for current index
              if (error && incorrectIndexes.includes(index)) {
                setIncorrectIndexes(
                  incorrectIndexes.filter((i) => i !== index)
                );
              }
            }}
          />
        ))}
      </div>

      {isFlashcard && reveal && (
        <InfoBox fullWidth asDiv>
          <h4>The correct answer is:</h4>
          {quiz.answers.join(" ")}
        </InfoBox>
      )}

      {!!hints.length && (
        <InfoBox fullWidth asDiv>
          <h4>Here are some hints to help you out</h4>
          <ul className={styles.hints}>
            {hints.map((hint) => (
              <li key={nanoid()}>{hint}</li>
            ))}
          </ul>
        </InfoBox>
      )}

      <FormButtons>
        {!isFlashcard && (
          <button
            type="submit"
            disabled={
              (hasAnswered && !isCorrect) ||
              !answers.every((answer) => answer.length > 0) ||
              loading ||
              isCorrect
            }
            className={`button small ${hasAnswered ? (isCorrect ? "success" : "danger") : "primary"}`}
          >
            {isCorrect
              ? "Correct!"
              : hasAnswered
                ? "Incorrect"
                : "Check Answer "}{" "}
            {loading && <Spinner primary size={14} margin={2} />}
          </button>
        )}

        {isFlashcard && (
          <button type="submit" className={`button small primary`}>
            Reveal Answer
          </button>
        )}

        {hasAnswered && isCorrect && (
          <button
            type="button"
            className="button small border"
            onClick={() => {
              setIncorrectIndexes([]);
              setAnswers(new Array(quiz.numOfAnswers).fill(""));
              setIsCorrect(false);
              setHasAnswered(false);
            }}
          >
            Try Again
          </button>
        )}
      </FormButtons>
    </Form>
  );
}
