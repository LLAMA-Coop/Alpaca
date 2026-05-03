"use client";

import styles from "./CourseDash.module.css";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  OverviewTab,
  QuizzesTabMain,
  NotesTabMain,
  SourcesMainTab,
} from "./CourseDashComponents";

export function CourseDash({ course, isLogged }) {
  const [currentTab, setCurrentTab] = useState(0);

  const courses = useStore((state) => state.courses);
  const user = useStore((state) => state.user);

  useEffect(() => {
    setCurrentTab(
      parseInt(
        typeof window !== "undefined"
          ? localStorage?.getItem("currentTab") || 0
          : 0
      )
    );
  }, []);

  const isEnrolled = !!courses.find((c) => c.id === course.id);

  const quizCount = course.quizzes?.length ?? 0;
  const noteCount = course.notes?.length ?? 0;
  const sourceCount = course.sources?.length ?? 0;

  const tabs = [
    {
      name: "Overview",
      count: null,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      name: "Quizzes",
      count: quizCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      name: "Notes",
      count: noteCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      name: "Sources",
      count: sourceCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
  ];

  const handleTabChange = (index) => {
    setCurrentTab(index);
    localStorage.setItem("currentTab", index);
  };

  const handleTabKeyDown = (e, index) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleTabChange(index > 0 ? index - 1 : tabs.length - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleTabChange(index < tabs.length - 1 ? index + 1 : 0);
    }
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbInner}>
          <Link href="/courses" className={styles.breadcrumbLink}>
            Courses
          </Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent}>{course.name}</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarHeader}>
              <p className={styles.sidebarLabel}>Course</p>
              <h2 className={styles.sidebarTitle}>{course.name}</h2>
              {isEnrolled && (
                <span className={styles.enrolledBadge}>Enrolled</span>
              )}
            </div>

            <nav className={styles.sidebarNav} aria-label="Course sections">
              <ul role="tablist" aria-orientation="vertical">
                {tabs.map((tab, index) => (
                  <li key={tab.name}>
                    <button
                      className={`${styles.navItem} ${currentTab === index ? styles.navItemActive : ""
                        }`}
                      onClick={() => handleTabChange(index)}
                      onKeyDown={(e) => handleTabKeyDown(e, index)}
                      role="tab"
                      aria-selected={currentTab === index}
                    >
                      <span className={styles.navIcon}>{tab.icon}</span>
                      <span className={styles.navLabel}>{tab.name}</span>
                      {tab.count !== null && (
                        <span
                          className={`${styles.navBadge} ${tab.count === 0 ? styles.navBadgeEmpty : ""
                            }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          {currentTab === 0 && (
            <OverviewTab
              course={course}
              isLogged={isLogged}
              isEnrolled={isEnrolled}
              user={user}
              onTabChange={handleTabChange}
            />
          )}
          {currentTab === 1 && <QuizzesTabMain course={course} />}
          {currentTab === 2 && <NotesTabMain course={course} />}
          {currentTab === 3 && <SourcesMainTab course={course} />}
        </main>
      </div>
    </div>
  );
}

