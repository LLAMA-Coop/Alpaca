"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import styles from "./userInput.module.css";
import { Input } from "../form/Form";

export default function UserInput({ isRegistering }) {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const [passwordFocus, setPasswordFocus] = useState(false);
  const passwordTooltip = useRef(null);
  const passwordInput = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (passwordFocus && !passwordTooltip.current.contains(e.target) && !passwordInput.current.contains(e.target)) {
        setPasswordFocus(false);
      }
    }

    document.addEventListener("click", handleOutsideClick);

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [passwordFocus]);

  const passwordWeaknesses = [
    "At least 8 characters",
    "Upper & lowercase letters",
    "A number",
    "A special character (@$!%*?&:)",
  ];

  function getWeaknesses() {
    let weaknesses = [];

    if (password.length < 8) {
      weaknesses.push("At least 8 characters");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z]).+$/.test(password)) {
      weaknesses.push("Upper & lowercase letters");
    }

    if (!/(?=.*\d)/.test(password)) {
      weaknesses.push("A number");
    }

    if (!/(?=.*[@$!%*?&:])/.test(password)) {
      weaknesses.push("A special character (@$!%*?&:)");
    }

    return weaknesses;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (username.length === 0) {
      setUsernameError("Username cannot be empty");
    }

    if (password.length === 0) {
      setPasswordError("Password cannot be empty");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:]).{8,}$/g.test(password)) {
      setPasswordError("Password is too weak");
      setPasswordFocus(true);
      return;
    }

    if (password.length > 0 && isRegistering && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    }

    if (username.length === 0 || password.length === 0) {
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      return;
    }

    const user = { username, password };

    setLoading(true);

    let response = await fetch("./api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    setLoading(false);

    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setUsernameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setPasswordFocus(false);

    console.log(await response.json());
  }

  return (
    <div className='centeredContainer'>
      <h3>Register new user</h3>

      <form className={styles.form}>
        <Input
          required={true}
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameError("");
          }}
          value={username}
          error={usernameError}
          label={"Username"}
        />

        <div style={{ position: 'relative' }} ref={passwordInput}>
          <Input
            type={"password"}
            required={true}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            value={password}
            error={passwordError}
            label={"Password"}
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
          />

          {passwordFocus && (
            <div className={styles.passwordTooltip} ref={passwordTooltip}>
              <p>
                Your password must contain:
              </p>

              <ul>
                {passwordWeaknesses.map((weakness, index) => {
                  return (
                    <li
                      key={index}
                      className={!getWeaknesses().includes(weakness) ? styles.weakness : ''}
                    >
                      <div>
                        {!getWeaknesses().includes(weakness) && (
                          <FontAwesomeIcon icon={faCheck} />
                        )}
                      </div>
                      <span>{weakness}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {isRegistering && (
          <Input
            type={"password"}
            required={true}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError("");
            }}
            value={confirmPassword}
            error={confirmPasswordError}
            label={"Password Match"}
          />
        )}

        <button onClick={handleSubmit} className="submitButton">
          {loading ? 'Sending...' : isRegistering ? "Register" : "Login"}
        </button>
      </form>
    </div>
  );
}
