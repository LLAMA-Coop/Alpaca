"use client";

import styles from "./Settings.module.css";
import { Profile } from "./Profile";
import { useState } from "react";

export function Settings({ user }) {
    const [currentTab, setCurrentTab] = useState(0);

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
                <h1>{tabs[currentTab].name}</h1>
                {tabs[currentTab].component}
            </section>
        </main>
    );
}
