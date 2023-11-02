"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./QuizInput.module.css";
import { Input } from "../client";
import MAX from "@/lib/max";

export default function BlankableInput({
    prompt,
    setPrompt,
    promptError,
    setPromptError,
    responses,
    setResponses,
}) {
    const [promptWords, setPromptWords] = useState([]);
    const promptBank = useRef(null);

    useEffect(() => {
        let resIndex = 0;
        setPromptWords(
            prompt
                .split(/(<blank\s*\/>)|\b/)
                .filter((x) => x !== undefined)
                .map((x) => {
                    if (/(<blank\s*\/>)/.test(x)) {
                        let newWord = responses[resIndex];
                        resIndex++;
                        if(resIndex === responses.length){
                            resIndex = 0;
                        }
                        return {
                            word: newWord,
                            isBlank: true,
                        };
                    } else if (/[\s.,!?;:"'<>\[\]{}()]+/.test(x)) {
                        return {
                            punctuation: x,
                        };
                    } else {
                        return {
                            word: x,
                            isBlank: false,
                        };
                    }
                }),
        );
    }, [prompt, responses]);

    function handleChangePrompt(e) {
        setPrompt(e.target.value);
        setPromptError("");
    }

    function handleChangeBlank() {
        const spans = promptBank.current.querySelectorAll("span");

        let promptArray = [];
        let responseArray = [];
        spans.forEach((x) => {
            let input = x.querySelector("input");
            if (input && input.checked) {
                promptArray.push("<blank />");
                responseArray.push(x.getAttribute("data-word"));
                return;
            }
            let word = x.getAttribute("data-word");
            if (word) {
                promptArray.push(word);
                return;
            }
            promptArray.push(x.textContent);
        });
        setPrompt(promptArray.join(""));
        setResponses(responseArray);
    }

    return (
        <div>
            <Input
                label={"Enter text that you wish to make blanks within"}
                description={"Question prompt. Can be a question or statement"}
                required={true}
                value={promptWords
                    .map((x) => {
                        if(x.punctuation){
                            return x.punctuation
                        }
                        return x.word;
                    })
                    .join("")}
                maxLength={MAX.prompt}
                error={promptError}
                onChange={handleChangePrompt}
            />
            <div className={styles.blankBank} ref={promptBank}>
                <p>Click the words you would like to be blank.</p>
                {promptWords.map((x, index) => {
                    if(x.punctuation){
                        return <span key={index}>{x.punctuation}</span>
                    } else {
                        return <span key={index} data-word={x.word}>
                            <input
                                type="checkbox"
                                id={`${index}_${x.word}`}
                                checked={x.isBlank}
                                onChange={handleChangeBlank}
                            />
                            <label htmlFor={`${index}_${x.word}`}>{x.word}</label>
                        </span>
                    }
                })}
            </div>
        </div>
    );
}
