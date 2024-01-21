"use client";

import { useStore } from "@/store/store";
import { useState } from "react";
import styles from "@/app/me/dashboard/Dash.module.css";
import {
    Card,
    QuizDisplay,
    UserStats,
    ListItem,
    InputPopup,
} from "@/app/components/client";
// import { canEdit } from "@/lib/auth";
import { CourseInput } from "@/app/components/Course/CourseInput";

const tabs = [
    {
        name: "Course Info",
        icon: (
            <g>
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </g>
        ),
    },
    {
        name: "Quizzes",
        icon: (
            <g>
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </g>
        ),
    },
    {
        name: "Notes",
        icon: (
            <g>
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </g>
        ),
    },
    {
        name: "Sources",
        icon: (
            <g>
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </g>
        ),
    },
];

export function CourseDash({ course }) {
    const user = useStore((state) => state.user);
    const noteStore = useStore((state) => state.notes);
    const sourceStore = useStore((state) => state.sources);
    const quizStore = useStore((state) => state.quizzes);
    const courses = useStore((state) => state.courses);

    const [isLoading, setIsLoading] = useState(false);

    const [currentTab, setCurrentTab] = useState(
        parseInt(
            typeof window != "undefined"
                ? localStorage.getItem("currentTab") || 0
                : 0,
        ),
    );

    if (!user) return null;

    // const isEditable = canEdit(user, course);
    const isEditable = true;

    function filter(x) {
        return x.courses.find((c) => c.toString() === course._id);
    }

    const quizzes = quizStore.filter(filter);
    const notes = noteStore.filter(filter);
    const sources = sourceStore.filter(filter);

    let sum = 0;
    let countOfCanLevel = 0;
    let lowestLevel;
    const userQuizzes = quizzes.map((q) => {
        const userQuiz = user.quizzes.find(
            (x) => x.quizId.toString() === q._id.toString(),
        );
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
            quizId: q._id,
            lastCorrect: new Date(0),
            level: 0,
            hiddenUntil: new Date(0),
        };
    });
    const averageLevel = quizzes.length ? sum / quizzes.length : 0;

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
                    <h1>{course.name}</h1>
                    <h2>{course.description}</h2>
                    <header>
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
                                                                key={course._id}
                                                            >
                                                                Unavailable
                                                            </li>
                                                        );
                                                    }

                                                    return (
                                                        <ListItem
                                                            key={course._id}
                                                            item={course.name}
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
                                            {course.prerequisites.map((p) => {
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
                                                        key={p.course._id}
                                                        item={display}
                                                    />
                                                );
                                            })}
                                        </ol>
                                    ) : (
                                        <p>No prerequisite courses listed</p>
                                    )}
                                </div>

                                {isEditable && (
                                    <InputPopup
                                        resource={course}
                                        type={"course"}
                                    />
                                )}
                            </Card>
                        )}
                        <ul>
                            {currentTab === 1 &&
                                quizzes.map((quiz) => {
                                    const userQuiz = userQuizzes.find(
                                        (x) =>
                                            x.quizId.toString() ===
                                            quiz._id.toString(),
                                    );

                                    return (
                                        <li key={quiz._id}>
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
                                    const noteSources = note.sources.map(
                                        (srcId) => {
                                            const src = sources.find(
                                                (source) =>
                                                    source._id.toString() ===
                                                    srcId.toString(),
                                            );

                                            if (!src) {
                                                return {
                                                    _id: srcId,
                                                    title: "Unavailable",
                                                    url: null,
                                                };
                                            }

                                            return src;
                                        },
                                    );
                                    return (
                                        <li key={note._id}>
                                            <Card
                                                title={note.title}
                                                description={`${note.text}`}
                                            >
                                                <div className={styles.card}>
                                                    <h4>Sources linked</h4>
                                                    <ul>
                                                        {noteSources.map(
                                                            (source) => {
                                                                return (
                                                                    <ListItem
                                                                        key={
                                                                            source._id
                                                                        }
                                                                        item={
                                                                            source.title
                                                                        }
                                                                        link={
                                                                            source.url
                                                                        }
                                                                    />
                                                                );
                                                            },
                                                        )}
                                                    </ul>
                                                </div>

                                                <div className={styles.card}>
                                                    Created By: {note.createdBy}
                                                </div>
                                            </Card>
                                        </li>
                                    );
                                })}

                            {currentTab === 3 &&
                                sources.map((source) => {
                                    return (
                                        <li key={source._id}>
                                            <Card
                                                title={source.title}
                                                subtitle={source.medium}
                                                buttons={[
                                                    {
                                                        label: "Visit the source page",
                                                        link: source.url,
                                                    },
                                                ]}
                                            >
                                                <div className={styles.card}>
                                                    <h4>Authors</h4>
                                                    {source.authors &&
                                                    source.authors.length ? (
                                                        <ul className="chipList">
                                                            {source.authors &&
                                                                source.authors.map(
                                                                    (cont) => (
                                                                        <ListItem
                                                                            key={
                                                                                cont
                                                                            }
                                                                            item={
                                                                                /^http/.test(
                                                                                    cont,
                                                                                )
                                                                                    ? "See all of the authors"
                                                                                    : cont
                                                                            }
                                                                            link={
                                                                                /^http/.test(
                                                                                    cont,
                                                                                )
                                                                                    ? cont
                                                                                    : null
                                                                            }
                                                                        />
                                                                    ),
                                                                )}
                                                        </ul>
                                                    ) : (
                                                        <p>No authors listed</p>
                                                    )}
                                                </div>
                                            </Card>
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
