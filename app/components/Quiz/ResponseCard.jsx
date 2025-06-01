"use client";

import { Input, InfoBox, Form, Spinner, FormButtons } from "@client";
import { correctConfetti } from "@/lib/correctConfetti";
import { useAlerts, useStore } from "@/store/store";
import { stringCompare } from "@/lib/stringCompare";
import listPrint from "@/lib/listPrint";
import styles from "./QuizInput.module.css";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

export function ResponseCard({
  quiz,
  canClientCheck,
  setCorrect,
  lighter,
  isFlashcard,
  handleWhenCorrect,
}) {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failures, setFailures] = useState(0);
  const [answer, setAnswer] = useState("");
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
    if ((hasAnswered || !answer) && !isFlashcard) return;

    setLoading(true);

    if (canClientCheck) {
      const isCorrect = quiz.answers.find(
        (a) => stringCompare(a, answer) >= 0.8
      );

      setReveal(true);

      if (!isCorrect) {
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
      if(handleWhenCorrect) handleWhenCorrect();

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
            body: JSON.stringify({ answers: answer }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check answer");
        } else {
          const data = await response.json();
          if (!data?.content) throw new Error("No data returned");

          const { isCorrect, hints } = data.content;

          setIsCorrect(isCorrect);
          setHasAnswered(true);
          setHints(hints);

          if (!isCorrect) {
            setFailures((prev) => prev + 1);
          } else {
            setHints([]);

            if(handleWhenCorrect) handleWhenCorrect();

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
      <Input
        type="text"
        value={answer}
        darker={lighter}
        label="Your Response"
        error={error ? "Incorrect" : null}
        disabled={hasAnswered && isCorrect}
        placeholder="Type your response here"
        success={hasAnswered && isCorrect && "- Yay! You got it right!"}
        onChange={(e) => {
          setAnswer(e.target.value);
          setHasAnswered(false);
        }}
      />

      {isFlashcard && reveal && (
        <InfoBox fullWidth asDiv>
          <h4>The correct answer is:</h4>
          {listPrint(quiz.answers, "or")}
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
              (hasAnswered && !isCorrect) || !answer || loading || isCorrect
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
              setAnswer("");
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
