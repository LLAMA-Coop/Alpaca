"use client";

import styles from "./CourseDash.module.css";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CourseTabInfo,
  CourseTabMain,
  NotesTabInfo,
  NotesTabMain,
  QuizzesTabInfo,
  QuizzesTabMain,
  SourcesInfoTab,
  SourcesMainTab,
} from "./CourseDashComponents";

export function CourseDash({ course, isLogged }) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [isTabChanging, setIsTabChanging] = useState(false);

  const courses = useStore((state) => state.courses);
  const user = useStore((state) => state.user);

  useEffect(() => {
    setCurrentTab(
      parseInt(
        typeof window != "undefined"
          ? localStorage?.getItem("currentTab") || 0
          : 0
      )
    );
  }, []);

  const isEnrolled = courses.find((c) => c.id === course.id);

  const tabs = [
    {
      name: "Overview",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z" />
        </svg>
      ),
      info: (
        <CourseTabInfo
          course={course}
          isLogged={isLogged}
          isEnrolled={isEnrolled}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ),
      main: (
        <CourseTabMain
          user={user}
          course={course}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ),
    },
    {
      name: "Quizzes",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm5 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z" />
        </svg>
      ),
      info: <QuizzesTabInfo course={course} />,
      main: <QuizzesTabMain course={course} />,
    },
    {
      name: "Notes",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6z" />
        </svg>
      ),
      info: <NotesTabInfo course={course} />,
      main: <NotesTabMain course={course} />,
    },
    {
      name: "Sources",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        </svg>
      ),
      info: <SourcesInfoTab course={course} />,
      main: <SourcesMainTab course={course} />,
    },
  ];

  // Handle tab change with loading state
  const handleTabChange = (index) => {
    setIsTabChanging(true);
    setCurrentTab(index);
    localStorage.setItem("currentTab", index);
    // Clear loading state after animation completes
    setTimeout(() => setIsTabChanging(false), 200);
  };

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e, index) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const newIndex = index > 0 ? index - 1 : tabs.length - 1;
      handleTabChange(newIndex);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const newIndex = index < tabs.length - 1 ? index + 1 : 0;
      handleTabChange(newIndex);
    }
  };

  return (
    <div className={styles.main}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbs}>
        <div className={styles.breadcrumbContent}>
          <Link href="/courses" className={styles.breadcrumbLink}>
            Courses
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{course.name}</span>
        </div>
      </div>

      {/* Header Section with Status Badge */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.titleWithBadge}>
            <h1 className={styles.courseTitle}>{course.name}</h1>
            {isEnrolled && (
              <span className={styles.enrolledBadge}>Enrolled</span>
            )}
          </div>

          {course.description && (
            <p className={styles.courseDescription}>{course.description}</p>
          )}

          {/* Enrollment Info */}
          {isEnrolled && (
            <div className={styles.headerMeta}>
              {user && (
                <div className={styles.metaItem}>
                  <strong>Learning as:</strong> {user.username}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.headerActions}>
            {tabs[0].info}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <ul className={styles.tabList} role="tablist">
            {tabs.map((tab, index) => (
              <li key={tab.name} className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${currentTab === index ? styles.active : ""
                    }`}
                  onClick={() => handleTabChange(index)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  aria-selected={currentTab === index}
                  role="tab"
                  aria-controls={`tab-panel-${index}`}
                >
                  {tab.icon}
                  <span className={styles.tabName}>{tab.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tab Info Sidebar */}
      {!isTabChanging && (
        <div className={styles.tabInfoBar}>
          <div className={styles.tabInfoContent}>
            {tabs[currentTab].info}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className={styles.contentWrapper}>
        <div className={styles.contentContainer}>
          <div
            className={`${styles.tabContent} ${currentTab === 0 ? styles.active : ""
              }`}
            id="tab-panel-0"
            role="tabpanel"
          >
            {currentTab === 0 && tabs[0].main}
          </div>

          <div
            className={`${styles.tabContent} ${currentTab === 1 ? styles.active : ""
              }`}
            id="tab-panel-1"
            role="tabpanel"
          >
            {currentTab === 1 && tabs[1].main}
          </div>

          <div
            className={`${styles.tabContent} ${currentTab === 2 ? styles.active : ""
              }`}
            id="tab-panel-2"
            role="tabpanel"
          >
            {currentTab === 2 && tabs[2].main}
          </div>

          <div
            className={`${styles.tabContent} ${currentTab === 3 ? styles.active : ""
              }`}
            id="tab-panel-3"
            role="tabpanel"
          >
            {currentTab === 3 && tabs[3].main}
          </div>
        </div>
      </div>
    </div>
  );
}
