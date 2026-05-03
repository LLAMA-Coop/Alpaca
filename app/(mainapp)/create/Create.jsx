"use client";

import { NoteInput, QuizInput, SourceInput, CourseInput } from "@client";
import { useEffect, useState } from "react";
import styles from "./Create.module.css";

export default function Create() {
    const [tab, setTab] = useState("Note");

    const tabs = {
        NOTE: <NoteInput />,
        QUIZ: <QuizInput />,
        SOURCE: <SourceInput />,
        COURSE: <CourseInput />,
    };

    useEffect(() => {
        if (typeof window !== undefined) {
            setTab(localStorage.getItem("createTab") || "Note");
        }
    }, []);

    return (
        <main className={styles.main}>
            <nav>
                <div className={styles.tabs}>
                    <ol>
                        {["NOTE", "QUIZ", "SOURCE", "COURSE"].map((tabName) => (
                            <li
                                tabIndex={0}
                                key={tabName}
                                onClick={() => {
                                    setTab(tabName);
                                    localStorage.setItem("createTab", tabName);
                                }}
                                className={tab === tabName ? styles.active : ""}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setTab(tabName);
                                        localStorage.setItem("createTab", tabName);
                                    }
                                }}
                            >
                                {tabName}
                            </li>
                        ))}
                    </ol>
                </div>
            </nav>

            <section className={styles.content}>
                <div>{tabs[tab]}</div>
            </section>
        </main>
    );
}
