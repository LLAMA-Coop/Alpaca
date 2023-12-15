"use client";

import styles from "./dash.module.css";
import { useState } from "react";
import { Avatar } from "@client";

const tabs = [
    {
        name: "User",
        icon: (
            <g>
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </g>
        ),
    },
    {
        name: "Courses",
        icon: (
            <g>
                <path d="M15 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                <path d="M13 17.5v4.5l2 -1.5l2 1.5v-4.5" />
                <path d="M10 19h-5a2 2 0 0 1 -2 -2v-10c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73" />
                <path d="M6 9l12 0" />
                <path d="M6 12l3 0" />
                <path d="M6 15l2 0" />
            </g>
        ),
    },
    {
        name: "Groups",
        icon: (
            <g>
                <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
                <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                <path d="M17 10h2a2 2 0 0 1 2 2v1" />
                <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
            </g>
        ),
    },
    {
        name: "Associates",
        icon: (
            <g>
                <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
            </g>
        ),
    },
];

export function Dashboard({ user, courses, groups, associates, more }) {
    const [currentTab, setCurrentTab] = useState(
        parseInt(localStorage?.getItem("currentTab") || 0),
    );

    return (
        <main className={styles.main}>
            <section>
                <nav>
                    <ul className={styles.tabList}>
                        {tabs.map((tab, index) => (
                            <li
                                className={
                                    currentTab === index ? styles.active : ""
                                }
                                key={tab}
                                onClick={() => {
                                    setCurrentTab(index);
                                    localStorage.setItem("currentTab", index);
                                }}
                            >
                                <div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        {tab.icon}
                                    </svg>
                                </div>

                                <span>{tab.name}</span>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.content}>
                    <header>
                        <h1>
                            {currentTab === 0 && (
                                <Avatar
                                    src={user.avatar}
                                    username={user.username}
                                    size={42}
                                />
                            )}

                            {currentTab === 0
                                ? user.username
                                : tabs[currentTab].name}

                            {currentTab === 0 && <span>XP 2783</span>}
                            {currentTab === 0 && <span>V</span>}
                        </h1>

                        <div className={styles.chips}>
                            {currentTab === 0 ? (
                                <>
                                    <div>
                                        <p>Quizzes</p>
                                        <p>{user.quizzes?.length || 0}</p>
                                    </div>

                                    <div>
                                        <p>Notes</p>
                                        <p>{user.notes?.length || 0}</p>
                                    </div>

                                    <div>
                                        <p>Associates</p>
                                        <p>{associates.length || 0}</p>
                                    </div>

                                    <div>
                                        <p>Groups</p>
                                        <p>{groups.length || 0}</p>
                                    </div>
                                </>
                            ) : currentTab === 1 ? (
                                <>
                                    <div>
                                        <p>Enrolled</p>
                                        <p>{courses.length || 0}</p>
                                    </div>

                                    <div>
                                        <p>Completed</p>
                                        <p>{courses.length || 0}</p>
                                    </div>
                                </>
                            ) : currentTab === 2 ? (
                                <>
                                    <div>
                                        <p>Created</p>
                                        <p>{groups.length || 0}</p>
                                    </div>

                                    <div>
                                        <p>Joined</p>
                                        <p>{groups.length || 0}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p> Associates </p>
                                        <p>{associates.length || 0}</p>
                                    </div>

                                    <div>
                                        <p>Online</p>
                                        <p>{associates.length || 0}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </header>

                    <main>
                        <ul>
                            {Array(42)
                                .fill()
                                .map((_, index) => (
                                    <div key={index} className={styles.card}>
                                        <h2>Card Title</h2>
                                        <p>
                                            Lorem ipsum dolor sit amet
                                            consectetur adipisicing elit.
                                            Quisquam, quod.
                                            <br />
                                            <br />
                                            Lorem ipsum dolor sit amet
                                            consectetur adipisicing elit.
                                            Quisquam, quod.
                                        </p>
                                    </div>
                                ))}
                        </ul>

                        {!more && (
                            <div>
                                <button>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
                                    </svg>

                                    <span>Load More</span>
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </section>
        </main>
    );
}
