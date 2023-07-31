"use client";
import { useState } from "react";
import styles from "./quizDisplay.module.css";

export default function ListAnswer({ canClientCheck, quiz, isOrdered }) {
  let [userResponse, setUserResponse] = useState(
    [...Array(quiz.correctResponses.length)].map(() => "")
  );
  let [responseStatus, setResponseStatus] = useState("empty");
  let [responseCorrect, setResponseCorrect] = useState(false);

  console.log("list answer", quiz, quiz.correctResponses);

  function handleChange(index, value) {
    setResponseStatus("incomplete");
    let array = [...userResponse];
    array[index] = value;
    setUserResponse(array);
  }

  function handleCheckAnswer() {
    setResponseStatus("complete");
    if (isOrdered) {
      let isIncorrect = userResponse.find((res, index) => {
        return res.toLowerCase() !== quiz.correctResponses[index].toLowerCase();
      });
      if (isIncorrect == undefined) {
        setResponseCorrect(true);
      }
    }

    if (!isOrdered) {
      const sortLowerCase = (a, b) => {
        let al = a.toLowerCase();
        let bl = b.toLowerCase();
        if (al < bl) return -1;
        if (al > bl) return 1;
        return 0;
      };
      let userAnswers = userResponse.sort(sortLowerCase);
      let correctAnswers = quiz.correctResponses.sort(sortLowerCase);
      let isIncorrect = userAnswers.find((res, index) => {
        return res.toLowerCase() !== correctAnswers[index].toLowerCase();
      });
      if (isIncorrect == undefined) {
        setResponseCorrect(true);
      }
    }
  }

  return (
    <div className={styles.quizCard}>
      <h4 id="prompt">{quiz.prompt}</h4>
      <ul>
        {quiz.correctResponses.map((ans, index) => {
          return (
            <li key={index}>
              <input
                type="text"
                aria-labelledby="prompt"
                id={"ans_" + index}
                defaultValue={userResponse[index]}
                onChange={(e) => handleChange(index, e.target.value)}
              ></input>
            </li>
          );
        })}
      </ul>

      <button onClick={handleCheckAnswer} className="submitButton">Check Answer</button>

      {responseCorrect && responseStatus === "complete" && <div>Correct!</div>}
      {!responseCorrect && responseStatus === "complete" && (
        <div>
          Incorrect. Acceptable answers are
          <ul>
            {quiz.correctResponses.map((ans) => {
              return <li key={ans}>{ans}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
