"use client";

import { useState } from "react";
import styles from "./Study.module.css";
import StudyNav from "./StudyNav";
import StudyList from "./StudyList";
import shuffleArray from "@/lib/shuffleArray";

export default function Study({ notes, quizzes, sources }) {
    const [tab, setTab] = useState("NOTES");

    const tabs = {
        NOTES: <StudyList resources={shuffleArray(notes)} type="note" heading="Notes" />,
        QUIZZES: (
            <StudyList
                resources={shuffleArray(quizzes).sort(
                    (quiz1, quiz2) => quiz1.level - quiz2.level
                )}
                type="quiz"
                heading="Flashcards"
            />
        ),
        SOURCES: <StudyList resources={sources} type="source" heading="Sources" />,
    };

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1>Study</h1>
                <p>
                    This is where you study your notes and practice quiz questions without
                    trying to level up
                </p>
            </header>

            <StudyNav defaultTab="NOTES" onTabChange={setTab} />

            <section className={styles.content}>
                <div>{tabs[tab]}</div>
            </section>
        </main>
    );
}
