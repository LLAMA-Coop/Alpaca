"use client";

import { useStore, useAlerts } from "@/store/store";
import {
  CourseDisplay,
  QuizDisplay,
  NoteDisplay,
  SourceDisplay,
  Spinner,
  MasoneryList,
} from "@/app/components/client";
import shuffleArray from "@/lib/shuffleArray";
import styles from "@/app/(dashboard)/me/dashboard/Dash.module.css";
import { useState } from "react";

function getUserQuizzesStats(quizIDs, quizList) {
  let sum = 0;
  let countOfCanLevel = 0;
  let lowestLevel;

  const userQuizzes = quizIDs?.length
    ? quizIDs
        .map((q) => {
          const userQuiz = q
            ? quizList.find((x) => x.id === q)
            : {
                id: 0,
                createAt: 0,
                level: 0,
                hiddenUntil: 0,
              };

          if (!userQuiz) return;

          sum += userQuiz.level;

          lowestLevel =
            lowestLevel == undefined || userQuiz.level < lowestLevel
              ? userQuiz.level
              : lowestLevel;

          if (new Date(userQuiz.hiddenUntil) < Date.now()) {
            countOfCanLevel++;
          }
          return userQuiz;
        })
        .filter((x) => !!x)
    : [];

  const averageLevel = userQuizzes.length ? sum / userQuizzes.length : 0;

  return { userQuizzes, averageLevel, lowestLevel, countOfCanLevel };
}

function getNotes(noteIDs, noteList) {
  return noteIDs?.length
    ? noteIDs.map((noteId) => noteList.find((note) => note.id === noteId))
    : [];
}

function getSources(sourceIDs, sourceList) {
  return sourceIDs?.length
    ? sourceIDs.map((sourceId) =>
        sourceList.find((source) => source.id === sourceId)
      )
    : [];
}

const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? "";

export function CourseTabInfo({
  course,
  isLogged,
  isEnrolled,
  isLoading,
  setIsLoading,
}) {
  const addAlert = useAlerts((state) => state.addAlert);

  async function enroll() {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${basePath}/api/course/${course.id}/enroll`,
        {
          method: "POST",
        }
      );
      const { message } = await response.json();

      if (response.success) {
        addAlert({
          success: true,
          message,
        });

        window.location.reload();
      } else {
        addAlert({
          success: false,
          message: message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error(error);
      addAlert({
        success: false,
        message: `Something went wrong: ${error.message}`,
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
        }
      );
      const { message } = await response.json();

      if (response.success) {
        addAlert({
          success: true,
          message,
        });

        window.location.reload();
      } else {
        addAlert({
          success: false,
          message: message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error(error);
      addAlert({
        success: false,
        message: `Something went wrong: ${error.message}`,
      });
    }

    setIsLoading(false);
  }

  return (
    <>
      {isLogged && (
        <button
          onClick={() => {
            if (isEnrolled) unenroll();
            else enroll();
          }}
          className={`button ${isEnrolled ? "danger" : "primary"}`}
        >
          {isEnrolled ? "Unenroll from this course" : "Enroll in this course"}

          {isLoading && <Spinner />}
        </button>
      )}
    </>
  );
}

export function CourseTabMain({ user, course, isLoading, setIsLoading }) {
  const [courseState, setCourseState] = useState({ ...course });
  const addAlert = useAlerts((state) => state.addAlert);

  async function enrollment(action) {
    // The `action` is one of three strings:
    // "private", "open", and "paid"

    setIsLoading(true);

    try {
      const response = await fetch(`${basePath}/api/course/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment: action,
        }),
      });

      if (response.ok) {
        addAlert({
          success: true,
          message: `Successful ${action}`,
        });

        console.log(courseState);

        setCourseState((prev) => ({
          ...prev,
          enrollment: action,
        }));
      } else {
        addAlert({
          success: false,
          message: `${response.status}: ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error(error);
      addAlert({
        success: false,
        message: `Something went wrong: ${error.message}`,
      });
    }

    setIsLoading(false);
  }

  async function permissions(action) {
    // The `action` is shaped like:
    // {
    //   allRead: Boolean
    // }
    // More potential actions can be added later if the below route is set up to receive

    setIsLoading(true);

    try {
      const response = await fetch(`${basePath}/api/course/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissions: action,
        }),
      });

      if (response.ok) {
        addAlert({
          success: true,
          message: `Successfully changed permissions for course`,
        });

        setCourseState((prev) => ({
          ...prev,
          permissions: {
            ...action,
          },
        }));
      } else {
        addAlert({
          success: false,
          message: `${response.status}: ${response.statusText}`,
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
    <div className={styles.userContent}>
      {user?.id === course.creator.id && (
        <div className={styles.actionButtons}>
          {/* There are actually three choices for enrollment: "private", "open", and "paid" */}
          <button
            onClick={() => {
              if (courseState.enrollment === "open") {
                enrollment("private");
              } else {
                enrollment("open");
              }
            }}
            className="button"
          >
            {courseState.enrollment === "open"
              ? "Close enrollment"
              : "Open enrollment"}

            {isLoading && <Spinner />}
          </button>

          <button
            onClick={() => {
              if (courseState.permissions.allRead) {
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
            {courseState.permissions.allRead ? "Make private" : "Make public"}

            {isLoading && <Spinner />}
          </button>
        </div>
      )}

      <h3>Description</h3>
      <p className={styles.description}>{course.description}</p>

      {course.parents?.length > 0 && (
        <>
          <h3>Parent Courses</h3>

          <MasoneryList>
            {course.parents.map((course) => (
              <CourseDisplay lighter key={course.id} course={course} />
            ))}
          </MasoneryList>
        </>
      )}
      {!course.parents?.length && <h3>No Parent Courses</h3>}

      {course.prerequisites?.length > 0 && (
        <>
          <h3>Prerequisite Courses</h3>

          <MasoneryList>
            {course.prerequisites.map((course) => (
              <CourseDisplay lighter key={course.id} course={course} />
            ))}
          </MasoneryList>
        </>
      )}
      {!course.prerequisites?.length && <h3>No Prerequisite Courses</h3>}
    </div>
  );
}

export function QuizzesTabInfo({ course }) {
  const quizzes = useStore((state) => state.quizzes);

  const { averageLevel, lowestLevel, countOfCanLevel } = getUserQuizzesStats(
    course.quizzes,
    quizzes
  );

  return (
    <>
      <span>Average Level: {averageLevel.toFixed(3)}</span>
      <span>Lowest Level: {lowestLevel}</span>
      <span>Available to Level Up: {countOfCanLevel}</span>
    </>
  );
}

export function QuizzesTabMain({ course }) {
  const quizzes = useStore((state) => state.quizzes);

  const { userQuizzes } = getUserQuizzesStats(course.quizzes, quizzes);

  return (
    <div className={styles.userContent}>
      {userQuizzes.length > 0 && (
        <>
          <h3>Quizzes related to this course</h3>

          <MasoneryList>
            {shuffleArray(userQuizzes)
              .sort((a, b) => {
                if (
                  b.hiddenUntil === "" ||
                  new Date(a.hiddenUntil) > new Date(b.hiddenUntil)
                ) {
                  return 1;
                }
                if (
                  a.hiddenUntil === "" ||
                  new Date(a.hiddenUntil) < new Date(b.hiddenUntil)
                ) {
                  return -1;
                }
                return a.level - b.level;
              })
              .map((quiz) =>
                quiz ? <QuizDisplay lighter quiz={quiz} key={quiz.id} /> : ""
              )}
          </MasoneryList>
        </>
      )}

      {!userQuizzes?.length && <h3>No Available Quizzes for this Course</h3>}
    </div>
  );
}

export function NotesTabInfo({ course }) {
  const notes = useStore((state) => state.notes);
  const courseNotesLength = getNotes(course.notes, notes).length;

  return <span>Available Notes: {courseNotesLength}</span>;
}

export function NotesTabMain({ course }) {
  const notes = useStore((state) => state.notes);
  const courseNotes = getNotes(course.notes, notes);

  return (
    <div className={styles.userContent}>
      {courseNotes?.length > 0 && (
        <>
          <h3>Notes related to this course</h3>

          <MasoneryList>
            {courseNotes.map((note) => (
              <NoteDisplay note={note} key={note.id} />
            ))}
          </MasoneryList>
        </>
      )}

      {!courseNotes?.length && <h3>No Available Notes for this Course</h3>}
    </div>
  );
}

export function SourcesInfoTab({ course }) {
  const sources = useStore((state) => state.sources);
  const courseSourcesLength = getSources(course.sources, sources).length;

  return <span>Available Sources: {courseSourcesLength}</span>;
}

export function SourcesMainTab({ course }) {
  const sources = useStore((state) => state.sources);
  const courseSources = getSources(course.sources, sources);

  return (
    <div className={styles.userContent}>
      {courseSources?.length > 0 && (
        <>
          <h3>Sources related to this course</h3>

          <MasoneryList>
            {courseSources.map((source) => (
              <SourceDisplay source={source} key={source.id} />
            ))}
          </MasoneryList>
        </>
      )}

      {!courseSources?.length && <h3>No Available Sources for this Course</h3>}
    </div>
  );
}
