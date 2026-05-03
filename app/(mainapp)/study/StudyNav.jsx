"use client";

import { useEffect, useState } from "react";
import styles from "./StudyNav.module.css";

export default function StudyNav({ defaultTab = "NOTES", onTabChange }) {
    const [tab, setTab] = useState(defaultTab);

    const tabs = ["NOTES", "QUIZZES", "SOURCES"];

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedTab = localStorage.getItem("studyTab") || defaultTab;
            setTab(savedTab);
            onTabChange?.(savedTab);
        }
    }, []);

    const handleTabClick = (tabName) => {
        setTab(tabName);
        localStorage.setItem("studyTab", tabName);
        onTabChange?.(tabName);
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.tabs}>
                <ol>
                    {tabs.map((tabName) => (
                        <li
                            tabIndex={0}
                            key={tabName}
                            onClick={() => handleTabClick(tabName)}
                            className={tab === tabName ? styles.active : ""}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleTabClick(tabName);
                                }
                            }}
                        >
                            {tabName}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
}
