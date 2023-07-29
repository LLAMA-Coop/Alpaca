"use client";
import { useState } from "react";
import styles from "./quizDisplay.module.css"

export default function ListAnswer({ canClientCheck, quiz, isOrdered }) {
  let [userResponse, setUserResponse] = useState(
    [...Array(quiz.correctResponses.length)].map(() => "")
  );
  let [responseStatus, setResponseStatus] = useState("empty");
  let [responseCorrect, setResponseCorrect] = useState(false);

  function handleChange(index, value) {
    setResponseStatus("incomplete");
    let array = [...userResponse];
    array[index] = value;
    setUserResponse(array);
  }

  function handleCheckAnswer() {
    setResponseStatus("complete");
    if (isOrdered) {
      isIncorrect = userResponse.find((res, index) => {
        return res.toLowerCase() !== quiz.correctResponses[index].toLowerCase();
      });
      if(isIncorrect == undefined){
        setResponseCorrect(true);
      }
    }

    if(!isOrdered){
        let userAnswers = Set(userResponse);
        let correctAnswers = Set(quiz.correctAnswers);
        if(userAnswers.length !== correctAnswers.length){
            setResponseCorrect(false);
            return;
        }
        userAnswers.forEach((ans) => {
            // Finish this
        })
    }
  }

  return (
    <div className={styles.quiz}>
      <p id="prompt">{quiz.prompt}</p>
      <ul>
        {quiz.correctResponses.map((ans, index) => {
          <li key={index}>
            <input
              type="text"
              aria-labelledby="prompt"
              id={"ans_" + index}
              onChange={(e) => handleChange(index, e.target.value)}
            ></input>
          </li>;
        })}
      </ul>

      <button onClick={handleCheckAnswer}>Check Answer</button>

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
