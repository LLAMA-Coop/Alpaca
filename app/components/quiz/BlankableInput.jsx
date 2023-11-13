"use client";

import styles from "./QuizInput.module.css";
import { Input } from "../client";
import { useEffect } from "react";
import MAX from "@/lib/max";

export default function BlankableInput({
    prompt,
    setPrompt,
    promptError,
    setPromptError,
    responses,
    setResponses,
}) {
    useEffect(() => {
        // If one of the word marked as blank is removed from the prompt,
        // remove it from the responses

        const words = prompt?.match(/\b([\w']+)\b/g) ?? [];
        const wordsWithIndex = words.map((x, index) => `${index}_${x}`);

        setResponses((prev) => {
            const newResponses = prev.filter((x) => wordsWithIndex.includes(x));
            return newResponses;
        });
    }, [prompt]);

    return (
        <div>
            <Input
                label={"Text"}
                description={"Question prompt. Can be a question or statement"}
                required={true}
                value={prompt}
                maxLength={MAX.prompt}
                error={promptError}
                onChange={(e) => {
                    setPrompt(e.target.value);
                    setPromptError("");
                }}
            />

            {prompt.length > 0 && (
                <div className={styles.blankBank}>
                    <p>Click the words you want to be blank.</p>

                    {prompt?.match(/\b([\w']+)\b/g)?.map((x, index) => (
                        <button
                            type="button"
                            key={index}
                            data-word={x}
                            className={`${styles.word} ${
                                responses.includes(`${index}_${x}`) &&
                                styles.checked
                            }`}
                            onClick={() => {
                                if (responses.includes(`${index}_${x}`)) {
                                    setResponses((prev) =>
                                        prev.filter(
                                            (y) => y !== `${index}_${x}`,
                                        ),
                                    );
                                } else {
                                    setResponses((prev) => [
                                        ...prev,
                                        `${index}_${x}`,
                                    ]);
                                }
                            }}
                        >
                            {x}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
