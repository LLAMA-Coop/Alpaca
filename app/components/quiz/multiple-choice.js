"use client";
import { useState } from "react";

export default function MultipleChoice({ canClientCheck, quiz }) {
  let [userResponse, setUserResponse] = useState("");
  let [responseStatus, setResponseStatus] = useState("empty");
  let [responseCorrect, setResponseCorrect] = useState(false);

  function handleChange(e) {
    e.preventDefault();
    setResponseStatus("incomplete");
    setUserResponse(e.target.value);
  }

  function handleCheckAnswer() {
    setResponseStatus("complete");
    let isCorrect = quiz.correctResponses.find((x) => x === userResponse);
    setResponseCorrect(isCorrect != undefined);
  }

  return (
    <div>
      <p>{quiz.prompt}</p>
      <ul>
        {quiz.choices.map((choice) => {
          return (
            <li key={choice}>
              <label htmlFor={"choice_" + choice}>
                {choice}
                <input
                  type="radio"
                  name="choice"
                  id={choice}
                  value={choice}
                  checked={userResponse === choice}
                  onChange={handleChange}
                ></input>
              </label>
            </li>
          );
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
