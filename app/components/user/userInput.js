"use client";
import makeUniqueId from "@/app/code/uniqueId";
import { useEffect, useState } from "react";
import styles from "./userInput.module.css";

export default function UserInput({ isRegistering }) {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [confirm, setConfirm] = isRegistering
    ? useState("")
    : [undefined, undefined];

  let [validPassword, setValidPassword] = useState(true);
  let [confirmMatch, setConfirmMatch] = isRegistering
    ? useState(true)
    : [undefined, undefined];

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  useEffect(() => {
    if (password.length > 4) {
      setValidPassword(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:])[A-Za-z\d@$!%*?&:]{8,}$/.test(
          password
        )
      );
    }
    if (confirm.length > 4) {
      setConfirmMatch(password === confirm);
    }
  }, [password, confirm]);

  function passwordWeaknesses() {
    let weaknesses = [];
    if (password.length < 8) {
      weaknesses.push("Minimum of 8 characters");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      weaknesses.push("At least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      weaknesses.push("At least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      weaknesses.push("At least one numeral");
    }
    if (!/(?=.*[@$!%*?&:])/.test(password)) {
      weaknesses.push("At least one special character: @ $ ! % * ? & :");
    }
    return weaknesses;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!(username && validPassword && confirmMatch)) {
      console.error("cannot submit");
      return;
    }
    const user = { username, password };
    let response = await fetch("./api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    console.log(await response.json());
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h3>Register new user</h3>
        <form className={styles.form}>
          <div className={styles.inputContainer}>
            <label htmlFor={"username_" + uniqueId} className={styles.required}>
              Username
            </label>
            <input
              id={"username_" + uniqueId}
              type="text"
              defaultValue={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <label htmlFor={"password_" + uniqueId} className={styles.required}>
              Password
            </label>

            <input
              id={"password_" + uniqueId}
              type="password"
              defaultValue={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
            />

            {validPassword ? null : (
              <div className={styles.warn}>
                Please use a stronger password.
                <ul>
                  {passwordWeaknesses().map((weakness, index) => {
                    return <li key={index}>{weakness}</li>;
                  })}
                </ul>
              </div>
            )}
          </div>

          {isRegistering && (
            <div className={styles.inputContainer}>
              <label htmlFor={"confirm_" + uniqueId} className={styles.required}>
                Confirm Password
              </label>
              <input
                id={"confirm_" + uniqueId}
                type="password"
                defaultValue={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                }}
                required
              />
              {confirmMatch ? null : <span className={styles.warn}>Both passwords must match</span>}
            </div>
          )}

          <button onClick={handleSubmit}>
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
