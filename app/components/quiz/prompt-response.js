"use client";
import { useEffect, useState } from "react";
import makeUniqueId from "@/app/code/uniqueId";
import styles from "./quizDisplay.module.css"

export default function PromptResponse({ canClientCheck, quiz }) {
  let [userResponse, setUserResponse] = useState("");
  let [responseStatus, setResponseStatus] = useState("empty");
  let [responseCorrect, setResponseCorrect] = useState(false);

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  function handleInput(e) {
    e.preventDefault();
    setResponseStatus("incomplete");
    setUserResponse(e.target.value);
  }

  function handleCheckAnswer() {
    setResponseStatus("complete");
    let isCorrect = quiz.correctResponses.find(
      (x) => x.toLowerCase() === userResponse.toLowerCase()
    );
    setResponseCorrect(isCorrect != undefined);
  }

  return (
    <div className={styles.quiz}>
      <p>{quiz.prompt}</p>
      <label htmlFor={"response_" + uniqueId}>
        Your Response
        <input
          id={"response_" + uniqueId}
          type="text"
          defaultValue={userResponse}
          onChange={handleInput}
        ></input>
      </label>
      
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
