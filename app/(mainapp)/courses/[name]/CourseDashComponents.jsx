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
import styles from "./CourseDash.module.css";
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

/* ── Overview Tab ── */
export function OverviewTab({ course, isLogged, isEnrolled, user, onTabChange }) {
  const quizzes = useStore((state) => state.quizzes);
  const notes = useStore((state) => state.notes);
  const sources = useStore((state) => state.sources);

  const [courseState, setCourseState] = useState({ ...course });
  const [isLoading, setIsLoading] = useState(false);
  const addAlert = useAlerts((state) => state.addAlert);

  const quizCount = course.quizzes?.length ?? 0;
  const noteCount = getNotes(course.notes, notes).length;
  const sourceCount = getSources(course.sources, sources).length;

  const { userQuizzes, averageLevel, countOfCanLevel } = getUserQuizzesStats(
    course.quizzes,
    quizzes
  );

  // Quizzes with hiddenUntil in the future = well-reviewed
  const reviewedCount = userQuizzes.filter(
    (q) => q.hiddenUntil && new Date(q.hiddenUntil) > Date.now()
  ).length;
  const progressPct =
    userQuizzes.length > 0
      ? Math.round((reviewedCount / userQuizzes.length) * 100)
      : 0;

  async function enroll() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${basePath}/api/course/${course.id}/enroll`,
        { method: "POST" }
      );
      const { message } = await response.json();
      addAlert({ success: response.ok, message: message || "Something went wrong" });
      if (response.ok) window.location.reload();
    } catch (error) {
      addAlert({ success: false, message: `Something went wrong: ${error.message}` });
    }
    setIsLoading(false);
  }

  async function unenroll() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${basePath}/api/course/${course.id}/unenroll`,
        { method: "POST" }
      );
      const { message } = await response.json();
      addAlert({ success: response.ok, message: message || "Something went wrong" });
      if (response.ok) window.location.reload();
    } catch (error) {
      addAlert({ success: false, message: `Something went wrong: ${error.message}` });
    }
    setIsLoading(false);
  }

  async function enrollment(action) {
    setIsLoading(true);
    try {
      const response = await fetch(`${basePath}/api/course/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment: action }),
      });
      if (response.ok) {
        addAlert({ success: true, message: `Enrollment set to ${action}` });
        setCourseState((prev) => ({ ...prev, enrollment: action }));
      } else {
        addAlert({ success: false, message: `${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      addAlert({ success: false, message: `Something went wrong: ${error.message}` });
    }
    setIsLoading(false);
  }

  async function permissions(action) {
    setIsLoading(true);
    try {
      const response = await fetch(`${basePath}/api/course/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: action }),
      });
      if (response.ok) {
        addAlert({ success: true, message: "Permissions updated" });
        setCourseState((prev) => ({ ...prev, permissions: { ...action } }));
      } else {
        addAlert({ success: false, message: `${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      addAlert({ success: false, message: "Something went wrong" });
    }
    setIsLoading(false);
  }

  return (
    <>
      {/* Progress Card */}
      <div className={styles.card}>
        <div className={styles.progressHeader}>
          <p className={styles.cardLabel}>Your Progress</p>
          {userQuizzes.length > 0 && (
            <span className={styles.progressPct}>{progressPct}% reviewed</span>
          )}
        </div>

        {userQuizzes.length > 0 && (
          <div className={styles.progressBarWrap}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        <div className={styles.progressStats}>
          <button
            className={styles.progressStat}
            onClick={() => onTabChange(1)}
            title="Go to Quizzes"
          >
            <span className={styles.progressStatValue}>{quizCount}</span>
            <span className={styles.progressStatLabel}>Quizzes</span>
          </button>
          <button
            className={styles.progressStat}
            onClick={() => onTabChange(2)}
            title="Go to Notes"
          >
            <span className={styles.progressStatValue}>{noteCount}</span>
            <span className={styles.progressStatLabel}>Notes</span>
          </button>
          <button
            className={styles.progressStat}
            onClick={() => onTabChange(3)}
            title="Go to Sources"
          >
            <span className={styles.progressStatValue}>{sourceCount}</span>
            <span className={styles.progressStatLabel}>Sources</span>
          </button>
        </div>

        {userQuizzes.length > 0 && (
          <div className={styles.quizProgressRow}>
            <div className={styles.quizStat}>
              <span className={styles.quizStatValue}>{averageLevel.toFixed(1)}</span>
              <span className={styles.quizStatLabel}>Avg Quiz Level</span>
            </div>
            <div className={styles.quizStat}>
              <span className={styles.quizStatValue}>{reviewedCount}</span>
              <span className={styles.quizStatLabel}>Well Reviewed</span>
            </div>
            <div className={styles.quizStat}>
              <span className={styles.quizStatValue}>{countOfCanLevel}</span>
              <span className={styles.quizStatLabel}>Ready to Level Up</span>
            </div>
          </div>
        )}
      </div>

      {/* About Card */}
      <div className={styles.card}>
        <p className={styles.cardLabel}>About this course</p>
        <h1 className={styles.courseTitle}>{course.name}</h1>
        {course.description ? (
          <p className={styles.courseDescription}>{course.description}</p>
        ) : (
          <p className={styles.noDescription}>No description provided.</p>
        )}

        {isLogged && (
          <div className={styles.courseActions}>
            <button
              onClick={() => (isEnrolled ? unenroll() : enroll())}
              className={`button ${isEnrolled ? "danger" : "primary"}`}
              disabled={isLoading}
            >
              {isEnrolled ? "Unenroll from this course" : "Enroll in this course"}
              {isLoading && <Spinner />}
            </button>
          </div>
        )}
      </div>

      {/* Owner Settings Card */}
      {user?.id === course.creator.id && (
        <div className={styles.card}>
          <p className={styles.cardLabel}>Course Settings</p>
          <div className={styles.ownerButtons}>
            <button
              onClick={() =>
                enrollment(courseState.enrollment === "open" ? "private" : "open")
              }
              className="button"
              disabled={isLoading}
            >
              {courseState.enrollment === "open"
                ? "Close enrollment"
                : "Open enrollment"}
              {isLoading && <Spinner />}
            </button>
            <button
              onClick={() =>
                permissions({ allRead: !courseState.permissions?.allRead })
              }
              className="button"
              disabled={isLoading}
            >
              {courseState.permissions?.allRead ? "Make private" : "Make public"}
              {isLoading && <Spinner />}
            </button>
          </div>
        </div>
      )}

      {/* Related Courses */}
      {course.parents?.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>Parent Courses</h3>
          <MasoneryList>
            {course.parents.map((c) => (
              <CourseDisplay lighter key={c.id} course={c} />
            ))}
          </MasoneryList>
        </div>
      )}

      {course.prerequisites?.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>Prerequisite Courses</h3>
          <MasoneryList>
            {course.prerequisites.map((c) => (
              <CourseDisplay lighter key={c.id} course={c} />
            ))}
          </MasoneryList>
        </div>
      )}
    </>
  );
}

export function QuizzesTabMain({ course }) {
  const quizzes = useStore((state) => state.quizzes);
  const { userQuizzes } = getUserQuizzesStats(course.quizzes, quizzes);

  return (
    <div className={styles.tabSection}>
      {userQuizzes.length > 0 ? (
        <div>
          <h3>Quizzes</h3>
          <MasoneryList>
            {shuffleArray(userQuizzes)
              .sort((a, b) => {
                if (b.hiddenUntil === "" || new Date(a.hiddenUntil) > new Date(b.hiddenUntil)) return 1;
                if (a.hiddenUntil === "" || new Date(a.hiddenUntil) < new Date(b.hiddenUntil)) return -1;
                return a.level - b.level;
              })
              .map((quiz) =>
                quiz ? <QuizDisplay lighter quiz={quiz} key={quiz.id} /> : null
              )}
          </MasoneryList>
        </div>
      ) : (
        <h3>No Available Quizzes for this Course</h3>
      )}
    </div>
  );
}

export function NotesTabMain({ course }) {
  const notes = useStore((state) => state.notes);
  const courseNotes = getNotes(course.notes, notes);

  return (
    <div className={styles.tabSection}>
      {courseNotes.length > 0 ? (
        <div>
          <h3>Notes</h3>
          <MasoneryList>
            {courseNotes.map((note) => (
              <NoteDisplay note={note} key={note.id} />
            ))}
          </MasoneryList>
        </div>
      ) : (
        <h3>No Available Notes for this Course</h3>
      )}
    </div>
  );
}

export function SourcesMainTab({ course }) {
  const sources = useStore((state) => state.sources);
  const courseSources = getSources(course.sources, sources);

  return (
    <div className={styles.tabSection}>
      {courseSources.length > 0 ? (
        <div>
          <h3>Sources</h3>
          <MasoneryList>
            {courseSources.map((source) => (
              <SourceDisplay source={source} key={source.id} />
            ))}
          </MasoneryList>
        </div>
      ) : (
        <h3>No Available Sources for this Course</h3>
      )}
    </div>
  );
}
