"use client";

export default function MultipleChoice({ canClientCheck, quiz }) {
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
                  id={"choice_" + choice}
                ></input>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
