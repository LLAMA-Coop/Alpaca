"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./QuizInput.module.css";
import { Input } from "@client";
import { validation } from "@/lib/validation";
import { getNanoId } from "@/lib/random";

export function BlankableInput({
  prompt,
  setPrompt,
  error,
  answers,
  setAnswers,
}) {
  const [promptInput, setPromptInput] = useState("");
  const [promptWords, setPromptWords] = useState([]);
  const promptBank = useRef(null);

  useEffect(() => {
    let resIndex = 0;
    const promptArray = prompt
      .split(/(<blank\s*\/>)|([A-Za-z]+(?:'[A-Za-z]+)?|\W)/)
      .filter((x) => x !== undefined && x !== "")
      .map((x) => {
        if (/(<blank\s*\/>)/.test(x)) {
          let newWord = answers[resIndex];
          resIndex++;
          if (resIndex === answers.length) {
            resIndex = 0;
          }
          return {
            word: newWord,
            isBlank: true,
          };
        } else if (/[\s.,!?;:"<>\[\]{}()]+/.test(x)) {
          return {
            punctuation: x,
          };
        } else {
          return {
            word: x,
            isBlank: false,
          };
        }
      });

    setPromptWords(promptArray);
    setPromptInput(promptArray.map((x) => x.punctuation ?? x.word).join(""));
  }, []);

  function handleChangePrompt(e) {
    setPromptInput(e.target.value);
    let promptArray = e.target.value
      .split(/([A-Za-z]+(?:'[A-Za-z]+)?|\W)/)
      .filter((x) => x !== undefined && x !== "")
      .map((x) => {
        if (/[\s.,!?;:"<>\[\]{}()]+/.test(x)) {
          return {
            punctuation: x,
          };
        } else {
          return {
            word: x,
            isBlank: false,
          };
        }
      });

    let words = [...promptWords];
    promptArray.forEach((wordObj, index) => {
      // punctuation is not able to be a blank
      if (wordObj.punctuation) return;

      if (
        wordObj.word &&
        words[index] &&
        words[index].word &&
        wordObj.word === words[index].word
      ) {
        wordObj.isBlank = words[index].isBlank;
        return;
      }

      if (!words[index]) {
        return;
      }

      if (wordObj.word !== words[index].word) {
        let props = words.find((x, idx) => {
          // This prevents it from marking isBlank true for all matching words
          // The bad news is that if you delete or paste multiple words, all of the isBlanks will be made false
          if (idx < index - 2 || idx > index + 2) {
            return false;
          }
          return x.word === wordObj.word;
        });

        if (props) {
          wordObj.isBlank = props.isBlank;
        } else if (
          (words[index - 2] &&
            promptArray[index - 2] &&
            words[index - 2].word === promptArray[index - 2].word) ||
          (words[index + 2] &&
            promptArray[index + 2] &&
            words[index + 2].word === promptArray[index + 2].word)
        ) {
          wordObj.isBlank = words[index].isBlank;
        }
      }
    });

    setPromptWords(promptArray);
    setAnswers(promptArray.filter((x) => x.isBlank).map((x) => x.word));
    setPrompt(
      promptArray
        .map((x) => {
          if (x.isBlank) {
            return "<blank />";
          }
          return x.punctuation ?? x.word;
        })
        .join("")
    );
  }

  function handleChangeBlank() {
    const spans = promptBank.current.querySelectorAll("span");

    let promptArray = [];
    let responseArray = [];
    let words = [...promptWords];

    spans.forEach((x, index) => {
      let input = x.querySelector("input");

      if (input && input.checked) {
        promptArray.push("<blank />");
        words[index].isBlank = true;
        responseArray.push(x.getAttribute("data-word"));
      } else if (input && !input.checked) {
        promptArray.push(x.getAttribute("data-word"));
        words[index].isBlank = false;
      } else {
        promptArray.push(x.textContent);
      }
    });

    setPrompt(promptArray.join(""));
    setPromptWords(words);
    setAnswers(responseArray);
  }

  return (
    <div>
      <Input
        required
        error={error}
        value={promptInput}
        onChange={handleChangePrompt}
        maxLength={validation.quiz.prompt.maxLength}
        label="Enter text that you wish to make blanks within"
      />

      <div className={styles.blankBank} ref={promptBank}>
        <p>Click the words you would like to be blank.</p>

        {promptWords.map((x) => {
          const id = getNanoId();

          if (x.punctuation) {
            return <span key={id}>{x.punctuation}</span>;
          } else {
            return (
              <span key={id} data-word={x.word}>
                <input
                  id={id}
                  type="checkbox"
                  autoCapitalize="none"
                  checked={x.isBlank}
                  onChange={handleChangeBlank}
                />

                <label
                  htmlFor={id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      document.getElementById(id).click();
                      e.currentTarget.focus();
                    }
                  }}
                >
                  {x.word}
                </label>
              </span>
            );
          }
        })}
      </div>
    </div>
  );
}
