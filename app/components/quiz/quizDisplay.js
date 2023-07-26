"use client";
import makeUniqueId from "@/app/code/uniqueId";
import { useEffect, useState } from "react";
import styles from "./quizDisplay.module.css";

// What the quiz displays depends on whether it is a client-checked or server-checked quiz component
// If client-checked, everything is rendered from the Quiz object
// If server-checked, only enough data for the prompt is displayed until the response is sent to the server
//  after which, the server provides the remaining data for the Quiz object
// Server-checked is for testing apps that want to prevent cheating

// sent into component via canClientCheck boolean

export default function Quiz({ canClientCheck, quiz }) {
  let [userResponse, setUserResponse] = useState("");
  let [responseCorrect, setResponseCorrect] = useState(false);

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  function handleCheckAnswer() {
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
          onChange={(e) => {
            setUserResponse(e.target.value);
          }}
        ></input>
      </label>
      <button onClick={handleCheckAnswer}>Check Answer</button>

    {/* multiple states to consider: 1. not answered, 2. wrong, 3. correct */}
      {responseCorrect && userResponse.length > 0 ? (
        <div>Correct!</div>
      ) : (
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
