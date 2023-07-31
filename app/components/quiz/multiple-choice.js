"use client";

import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./quizDisplay.module.css"
import confetti from 'canvas-confetti';
import { Input } from "../form/Form";
import { useState } from "react";

export default function PromptResponse({ canClientCheck, quiz }) {
  const [userResponse, setUserResponse] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(false);
  const [failures, setFailures] = useState(0);

  function handleInput(e) {
    e.preventDefault();
    setHasAnswered(false);
    setUserResponse(e.target.value);
  }

  function handleCheckAnswer() {
    if (hasAnswered) return;

    const isCorrect = quiz.correctResponses.find(
      (x) => x.toLowerCase() === userResponse.toLowerCase()
    );

    if (isCorrect) {
      setFailures(0);

      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      const audio = new Audio("/assets/sounds/clap.wav");
      audio.volume = 0.2;
      audio.play();
    } else {
      setFailures(failures + 1);
    }

    setCorrectAnswer(isCorrect != undefined);
    setHasAnswered(true);
  }

  const answers = quiz.choices.map((x) => ({ label: x, value: x }));

  return (
    <div
      className={styles.quizCard}
      style={{
        borderColor: hasAnswered ? correctAnswer ? "var(--accent-tertiary-1)" : "var(--accent-secondary-1)" : '',
      }}
    >
      <h4>{quiz.prompt}</h4>

      <Input
        type={"select"}
        choices={answers}
        label='Your Response'
        value={userResponse}
        onChange={handleInput}
        onEnter={handleCheckAnswer}
        outlineColor={hasAnswered && (correctAnswer ? "var(--accent-tertiary-1)" : "var(--accent-secondary-1)")}
      />

      <div id="particles"></div>

      <button
        onClick={handleCheckAnswer}
        className={`submitButton ${hasAnswered && (correctAnswer ? 'green icon' : 'red icon')}`}
      >
        {hasAnswered ? correctAnswer ? (
          <>
            {"Correct"}
            <FontAwesomeIcon icon={faCheck} />
          </>
        ) : (
          <>
            {"Incorrect"}
            <FontAwesomeIcon icon={faXmark} />
          </>
        ) : "Check Answer"}

      </button>
    </div>
  );
}
