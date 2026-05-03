"use client";

import styles from "./Dashboard.module.css";
import { CourseProgressCard } from "../Progress/ProgressBar";
import Link from "next/link";

export function DashboardWidget({ title, type, children }) {
    return (
        <div className={`${styles.widget} ${styles[`widget-${type}`]}`}>
            <div className={styles.widgetHeader}>
                <h3>{title}</h3>
            </div>
            <div className={styles.widgetContent}>{children}</div>
        </div>
    );
}

export function CoursesWidget({ courses = [] }) {
    if (courses.length === 0) {
        return (
            <DashboardWidget title="My Courses" type="courses">
                <p className={styles.empty}>
                    No courses yet.{" "}
                    <Link href="/courses" className="link">
                        Explore courses
                    </Link>
                </p>
            </DashboardWidget>
        );
    }

    return (
        <DashboardWidget title="My Courses" type="courses">
            <div className={styles.coursesList}>
                {courses.slice(0, 3).map((course) => (
                    <Link key={course.id} href={`/courses/${course.name}`}>
                        <CourseProgressCard
                            course={course}
                            completed={Math.floor(Math.random() * (course.quizzes?.length || 1) + 1)}
                            total={
                                (course.quizzes?.length || 0) +
                                (course.notes?.length || 0) +
                                (course.sources?.length || 0)
                            }
                        />
                    </Link>
                ))}
            </div>
        </DashboardWidget>
    );
}

export function RecentActivityWidget({ items = [] }) {
    return (
        <DashboardWidget title="Recent Activity" type="recent">
            {items.length === 0 ? (
                <p className={styles.empty}>No recent activity</p>
            ) : (
                <div className={styles.activityList}>
                    {items.map((item, idx) => (
                        <div key={idx} className={styles.activityItem}>
                            <span className={styles.activityType}>{item.type}</span>
                            <span className={styles.activityTitle}>{item.title}</span>
                            <span className={styles.activityTime}>{item.time}</span>
                        </div>
                    ))}
                </div>
            )}
        </DashboardWidget>
    );
}

export function StreakWidget({ streak = 0, longestStreak = 0 }) {
    return (
        <DashboardWidget title="Study Streak" type="streak">
            <div className={styles.streakContainer}>
                <div className={styles.streakItem}>
                    <span className={styles.streakLabel}>Current Streak</span>
                    <span className={styles.streakNumber}>
                        🔥 {streak} {streak === 1 ? "day" : "days"}
                    </span>
                </div>
                <div className={styles.streakItem}>
                    <span className={styles.streakLabel}>Longest Streak</span>
                    <span className={styles.streakNumber}>🏆 {longestStreak} days</span>
                </div>
            </div>
        </DashboardWidget>
    );
}

export function PersonalDashboard({ courses, recentActivity, streak, longestStreak }) {
    return (
        <div className={styles.dashboard}>
            <div className={styles.container}>
                <header className={styles.dashboardHeader}>
                    <h1>My Learning Dashboard</h1>
                    <p>Keep up your learning journey. You're doing great! 🌟</p>
                </header>

                <div className={styles.grid}>
                    <div className={styles.column1}>
                        <StreakWidget streak={streak} longestStreak={longestStreak} />
                        <CoursesWidget courses={courses} />
                    </div>

                    <div className={styles.column2}>
                        <RecentActivityWidget items={recentActivity} />
                    </div>
                </div>
            </div>
        </div>
    );
}
