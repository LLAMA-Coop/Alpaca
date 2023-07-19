"use client";
import { useEffect, useState } from "react";

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

  let uniqueId;
  useEffect(() => {
    uniqueId = new Date().getTime();
  }, []);

  useEffect(() => {
    setValidPassword(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:])[A-Za-z\d@$!%*?&:]{8,}$/.test(
        password
      )
    );
    setConfirmMatch(password === confirm);
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
    if(!(username && validPassword && confirmMatch)){
        console.error("cannot submit");
        return;
    }
    const user = { username, password };
    let response = await fetch("./api/user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })

    console.log(await response.json());
  }

  return (
    <form>
      <label htmlFor={"username" + uniqueId}>
        Username
        <input
          id={"username" + uniqueId}
          type="text"
          defaultValue={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        ></input>
      </label>

      <label htmlFor={"password" + uniqueId}>
        Password
        <input
          id={"password" + uniqueId}
          type="password"
          defaultValue={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          required
        ></input>
        {validPassword ? null : (
          <div>
            Please use a stronger password.
            <ul>
              {passwordWeaknesses().map((weakness, index) => {
                return <li key={index}>{weakness}</li>;
              })}
            </ul>
          </div>
        )}
      </label>

      {isRegistering && (
        <label htmlFor={"confirm" + uniqueId}>
          Confirm Password
          <input
            id={"confirm" + uniqueId}
            type="password"
            defaultValue={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
            }}
            required
          ></input>
          {confirmMatch ? null : <span>Both passwords must match</span>}
        </label>
      )}

      <input
        type="submit"
        onClick={handleSubmit}
        defaultValue={isRegistering ? "Register" : "Login"}
      ></input>
    </form>
  );
}
