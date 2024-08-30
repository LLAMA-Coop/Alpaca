"use client";

import {
    Card,
    QuizDisplay,
    UserStats,
    ListItem,
    InputPopup,
    Spinner,
} from "@client";
import { NoteDispClient } from "@/app/components/Note/NoteDispClient";
import { SourceDispClient } from "@/app/components/Source/SourceDispClient";
import styles from "@/app/me/dashboard/Dash.module.css";
import { useAlerts, useStore } from "@/store/store";
import { useState } from "react";

const tabs = [
    {
        name: "Course Info",
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
        name: "Quizzes",
        icon: (
            <g>
                <text
                    x="50%"
                    y="50%"
                    fontSize="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                >
                    ???
                </text>
            </g>
        ),
    },
    {
        name: "Notes",
        icon: (
            <g>
                <rect
                    x="3"
                    y="2"
                    width="18"
                    height="20"
                    rx="2"
                    ry="2"
                    fill="none"
                    stroke="white"
                />
                <line
                    x1="7"
                    y1="1"
                    x2="7"
                    y2="4"
                    stroke="white"
                    stroke-width="2"
                />
                <line
                    x1="12"
                    y1="1"
                    x2="12"
                    y2="4"
                    stroke="white"
                    stroke-width="2"
                />
                <line
                    x1="17"
                    y1="1"
                    x2="17"
                    y2="4"
                    stroke="white"
                    stroke-width="2"
                />
                <path
                    d="M6,10 C7,11 9,9 10,10 C11,11 13,9 14,10"
                    stroke="white"
                    fill="none"
                    stroke-width="1"
                />
                <path
                    d="M10,14 C11,15 13,13 14,14 C15,15 17,13 18,14"
                    stroke="white"
                    fill="none"
                    stroke-width="1"
                />
            </g>
        ),
    },
    {
        name: "Sources",
        icon: (
            <g>
                <rect
                    x="3"
                    y="2"
                    width="18"
                    height="22"
                    rx="2"
                    ry="2"
                    fill="none"
                    stroke="white"
                />

                <line
                    x1="8"
                    y1="7"
                    x2="16"
                    y2="7"
                    stroke="white"
                    stroke-width="1"
                />
                <line
                    x1="8"
                    y1="11"
                    x2="16"
                    y2="11"
                    stroke="white"
                    stroke-width="1"
                />
                <line
                    x1="8"
                    y1="15"
                    x2="14"
                    y2="15"
                    stroke="white"
                    stroke-width="1"
                />
            </g>
        ),
    },
];

const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? "";

export function CourseDash({ course, isLogged }) {
    const user = useStore((state) => state.user);
    const noteStore = useStore((state) => state.notes);
    const sourceStore = useStore((state) => state.sources);
    const quizStore = useStore((state) => state.quizzes);
    const courses = useStore((state) => state.courses);

    const [isLoading, setIsLoading] = useState(false);

    const addAlert = useAlerts((state) => state.addAlert);

    const [currentTab, setCurrentTab] = useState(0);

    // const isEditable = canEdit(user, course);
    const isEditable = true;

    const isEnrolled = courses?.find((x) => x.id === course.id);

    function filter(x) {
        return x.courses.find((c) => c === course.id);
    }

    const quizzes = quizStore.filter(filter);
    const notes = noteStore.filter(filter);
    const sources = sourceStore.filter(filter);

    let sum = 0;
    let countOfCanLevel = 0;
    let lowestLevel;
    const userQuizzes = quizzes.map((q) => {
        const userQuiz = user.quizzes.find((x) => x.quizId === q.id);
        if (userQuiz) {
            sum += userQuiz.level;
            lowestLevel =
                lowestLevel == undefined || userQuiz.level < lowestLevel
                    ? userQuiz.level
                    : lowestLevel;
            if (new Date(userQuiz.hiddenUntil) < Date.now()) {
                countOfCanLevel++;
            }
            return userQuiz;
        }
        countOfCanLevel++;
        return {
            quizId: q.id,
            lastCorrect: new Date(0),
            level: 0,
            hiddenUntil: new Date(0),
        };
    });
    const averageLevel = quizzes.length ? sum / quizzes.length : 0;

    async function enroll() {
        setIsLoading(true);

        try {
            const response = await fetch(
                `${basePath}/api/course/${course.id}/enroll`,
                {
                    method: "POST",
                },
            ).then((res) => res.json());

            if (response.success) {
                addAlert({
                    success: true,
                    message: response.message,
                });

                window.location.reload();
            } else {
                addAlert({
                    success: false,
                    message: response.message || "Something went wrong",
                });
            }
        } catch (error) {
            console.error(error);
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        }

        setIsLoading(false);
    }

    async function unenroll() {
        setIsLoading(true);

        try {
            const response = await fetch(
                `${basePath}/api/course/${course.id}/unenroll`,
                {
                    method: "POST",
                },
            ).then((res) => res.json());

            if (response.success) {
                addAlert({
                    success: true,
                    message: response.message,
                });

                window.location.reload();
            } else {
                addAlert({
                    success: false,
                    message: response.message || "Something went wrong",
                });
            }
        } catch (error) {
            console.error(error);
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        }

        setIsLoading(false);
    }

    async function enrollment(action) {
        setIsLoading(true);

        try {
            const response = await fetch(`${basePath}/api/course`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    enrollment: action,
                }),
            }).then((res) => res.json());

            if (response.success) {
                addAlert({
                    success: true,
                    message: response.message,
                });

                window.location.reload();
            } else {
                addAlert({
                    success: false,
                    message: response.message || "Something went wrong",
                });
            }
        } catch (error) {
            console.error(error);
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        }

        setIsLoading(false);
    }

    async function permissions(action) {
        setIsLoading(true);

        try {
            const response = await fetch(`${basePath}/api/course`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    permissions: action,
                }),
            }).then((res) => res.json());

            if (response.success) {
                addAlert({
                    success: true,
                    message: response.message,
                });

                window.location.reload();
            } else {
                addAlert({
                    success: false,
                    message: response.message || "Something went wrong",
                });
            }
        } catch (error) {
            console.error(error);
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        }

        setIsLoading(false);
    }

    return (
        <main className={styles.main}>
            <section>
                <nav>
                    <ul className={styles.tabList}>
                        {tabs.map((tab, index) => (
                            <li
                                key={tab.name}
                                tabIndex={0}
                                className={
                                    currentTab === index ? styles.active : ""
                                }
                                onClick={() => {
                                    setCurrentTab(index);
                                    localStorage.setItem("currentTab", index);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setCurrentTab(index);
                                        localStorage.setItem(
                                            "currentTab",
                                            index,
                                        );
                                    }
                                }}
                            >
                                <div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
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
                    <div className={styles.courseHead}>
                        <h1>{course.name}</h1>
                    </div>
                    <header className={styles.header}>
                        <h3>
                            {tabs[currentTab].name}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            >
                                {tabs[currentTab].icon}
                            </svg>

                            {currentTab === 0 && isLogged && (
                                <button
                                    onClick={() => {
                                        if (isEnrolled) {
                                            unenroll();
                                            // addAlert({
                                            //     success: false,
                                            //     message: "Not yet implemented",
                                            // });
                                        } else {
                                            enroll();
                                        }
                                    }}
                                    className="button"
                                >
                                    {isLoading ? (
                                        <Spinner />
                                    ) : isEnrolled ? (
                                        "Unenroll from this course"
                                    ) : (
                                        "Enroll in this course"
                                    )}
                                </button>
                            )}

                            {currentTab === 1 && (
                                <span>
                                    Average Level: {averageLevel.toFixed(3)}
                                </span>
                            )}

                            {currentTab === 1 && (
                                <span>Lowest Level: {lowestLevel}</span>
                            )}

                            {currentTab === 1 && (
                                <span>
                                    Available to Level Up: {countOfCanLevel}
                                </span>
                            )}

                            {currentTab === 2 && (
                                <span>Available Notes: {notes.length}</span>
                            )}

                            {currentTab === 3 && (
                                <span>Available Sources: {sources.length}</span>
                            )}
                        </h3>
                    </header>

                    <main className="scrollbar">
                        {currentTab === 0 && (
                            <div className={styles.column}>
                                <div className={styles.actionButtons}>
                                    {user?.id === course.createdBy && (
                                        <button
                                            onClick={() => {
                                                if (
                                                    course.enrollment === "open"
                                                ) {
                                                    enrollment("private");
                                                } else {
                                                    enrollment("open");
                                                }
                                            }}
                                            className="button"
                                        >
                                            {isLoading ? (
                                                <Spinner />
                                            ) : course.enrollment === "open" ? (
                                                "Close enrollment"
                                            ) : (
                                                "Open enrollment"
                                            )}
                                        </button>
                                    )}

                                    {user?.id === course.createdBy && (
                                        <button
                                            onClick={() => {
                                                if (
                                                    course.permissions.allRead
                                                ) {
                                                    permissions({
                                                        allRead: false,
                                                    });
                                                } else {
                                                    permissions({
                                                        allRead: true,
                                                    });
                                                }
                                            }}
                                            className="button"
                                        >
                                            {isLoading ? (
                                                <Spinner />
                                            ) : course.permissions.allRead ? (
                                                "Make private"
                                            ) : (
                                                "Make public"
                                            )}
                                        </button>
                                    )}
                                </div>

                                <Card
                                    title={course.name}
                                    description={course.description}
                                >
                                    <div className={styles.card}>
                                        <h4>Parent Courses</h4>
                                        {course.parentCourses &&
                                        course.parentCourses.length ? (
                                            <ol className="chipList">
                                                {course.parentCourses.map(
                                                    (course) => {
                                                        if (!course) {
                                                            return (
                                                                <li
                                                                    key={
                                                                        course.id
                                                                    }
                                                                >
                                                                    Unavailable
                                                                </li>
                                                            );
                                                        }

                                                        return (
                                                            <ListItem
                                                                key={course.id}
                                                                item={
                                                                    course.name
                                                                }
                                                            />
                                                        );
                                                    },
                                                )}
                                            </ol>
                                        ) : (
                                            <p>No parent courses listed</p>
                                        )}
                                    </div>

                                    <div className={styles.card}>
                                        <h4>Prerequisite Courses</h4>
                                        {course.prerequisites &&
                                        course.prerequisites.length ? (
                                            <ol className="chipList">
                                                {course.prerequisites.map(
                                                    (p) => {
                                                        const crs = p.course;
                                                        if (!crs) {
                                                            return (
                                                                <li key={p}>
                                                                    Unavailable
                                                                </li>
                                                            );
                                                        }

                                                        const display = `${crs.name} - Average Level Required: ${p.averageLevelRequired}`;

                                                        return (
                                                            <ListItem
                                                                key={
                                                                    p.course.id
                                                                }
                                                                item={display}
                                                            />
                                                        );
                                                    },
                                                )}
                                            </ol>
                                        ) : (
                                            <p>
                                                No prerequisite courses listed
                                            </p>
                                        )}
                                    </div>

                                    {isEditable && (
                                        <InputPopup
                                            resource={course}
                                            type={"course"}
                                        />
                                    )}
                                </Card>
                            </div>
                        )}

                        <ul>
                            {currentTab === 1 &&
                                quizzes.map((quiz) => {
                                    const userQuiz = userQuizzes.find(
                                        (x) => x.quizId === quiz.id,
                                    );

                                    return (
                                        <li key={quiz.id}>
                                            <QuizDisplay quiz={quiz} />
                                            {userQuiz && (
                                                <UserStats
                                                    userQuizInfo={userQuiz}
                                                />
                                            )}
                                        </li>
                                    );
                                })}

                            {currentTab === 2 &&
                                notes.map((note) => {
                                    return (
                                        <li key={note.id}>
                                            <NoteDispClient note={note} />
                                        </li>
                                    );
                                })}

                            {currentTab === 3 &&
                                sources.map((source) => {
                                    return (
                                        <li key={source.id}>
                                            <SourceDispClient source={source} />
                                        </li>
                                    );
                                })}
                        </ul>
                    </main>
                </div>
            </section>
        </main>
    );
}
