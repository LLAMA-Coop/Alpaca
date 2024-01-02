"use client";

import styles from "./Settings.module.css";
import { useAlerts } from "@/store/store";
import { Profile } from "./Profile";
import { useState } from "react";

export function Settings({ user }) {
    const [currentTab, setCurrentTab] = useState(0);
    const addAlert = useAlerts((state) => state.addAlert);
    const alerts = useAlerts((state) => state.alerts);

    const tabs = [
        {
            name: "Profile",
            component: <Profile user={user} />,
        },
        {
            name: "Account",
            component: "Account",
        },
        {
            name: "Appearance",
            component: "Appearance",
        },
        {
            name: "Security",
            component: "Security",
        },
        {
            name: "Notifications",
            component: "Notifications",
        },
        {
            name: "Billing",
            component: "Billing",
        },
        {
            name: "Integrations",
            component: "Integrations",
        },
        {
            name: "API",
            component: "API",
        },
        {
            name: "Advanced",
            component: "Advanced",
        },
    ];

    return (
        <main className={styles.main}>
            <aside>
                <nav>
                    <ul className={styles.tabList}>
                        {tabs.map((tab, index) => (
                            <li
                                key={index}
                                tabIndex={0}
                                className={
                                    index === currentTab ? styles.active : ""
                                }
                                onClick={() => setCurrentTab(index)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setCurrentTab(index);
                                    }
                                }}
                            >
                                {tab.name}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <section>
                <h1>
                    {tabs[currentTab].name}

                    {tabs[currentTab].name === "Profile" && (
                        <button
                            title="Copy User ID"
                            onClick={async () => {
                                await navigator.clipboard.writeText(user.id);
                                if (
                                    !alerts.find(
                                        (a) =>
                                            a.message ===
                                            "Copied User ID to clipboard",
                                    )
                                ) {
                                    addAlert({
                                        success: true,
                                        message: "Copied User ID to clipboard",
                                    });
                                }
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                            >
                                <path d="M10 9a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                                <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                                <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                                <path d="M8 16a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2" />
                            </svg>
                        </button>
                    )}
                </h1>

                {tabs[currentTab].component}
            </section>
        </main>
    );
}
