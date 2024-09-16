"use client";

import { NoteInput, QuizInput, SourceInput, CourseInput } from "@client";
import styles from "./Create.module.css";
import { useEffect, useState } from "react";

export default function Create() {
    const [tab, setTab] = useState("Note");

    const tabs = {
        Note: <NoteInput />,
        Quiz: <QuizInput />,
        Source: <SourceInput />,
        Course: <CourseInput />,
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
                        {["Note", "Quiz", "Source", "Course"].map((tabName) => (
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
                                        localStorage.setItem(
                                            "createTab",
                                            tabName,
                                        );
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
