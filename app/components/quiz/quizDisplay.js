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

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  return (
    <div className={styles.quiz}>
      <p>{quiz.prompt}</p>
      <label>
        Your Response
        <input
          type="text"
          defaultValue={userResponse}
          onChange={(e) => {
            setUserResponse(e.target.value);
          }}
        ></input>
      </label>
    </div>
  );
}
