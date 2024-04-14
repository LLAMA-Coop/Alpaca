"use client";

import { useState } from "react";
import { NoteInput} from "@client";
import { QuizInput} from "@client";
import { SourceInput} from "@client";
import { CourseInput} from "../components/Course/CourseInput";
import styles from "./Create.module.css";

export default function Create() {
    const [tab, setTab] = useState("note");

    return (
        <main className={styles.main}>
            <nav className={styles.tabsContainer}>
                <ol className={styles.tabs}>
                    <div
                        id="Tab1"
                        className={tab === "note" ? styles.active : ""}
                        onClick={() => setTab("note")}
                    >
                        NOTE
                    </div>
                    <div
                        id="Tab2"
                        className={tab === "quiz" ? styles.active : ""}
                        onClick={() => setTab("quiz")}
                    >
                        QUIZ
                    </div>
                    <div
                        id="Tab3"
                        className={tab === "source" ? styles.active : ""}
                        onClick={() => setTab("source")}
                    >
                        SOURCE
                    </div>
                    <div
                        id="Tab4"
                        className={tab === "course" ? styles.active : ""}
                        onClick={() => setTab("course")}
                    >
                        COURSE
                    </div>
                </ol>
            </nav>

            <div className={styles.cards}>
                {tab === "note" && <NoteInput />}
                {tab === "quiz" && <QuizInput />}
                {tab === "source" && <SourceInput />}
                {tab === "course" && <CourseInput />}
            </div>
        </main>
    );
}
