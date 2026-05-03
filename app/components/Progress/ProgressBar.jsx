"use client";

import styles from "./ProgressBar.module.css";

export function ProgressBar({ completed, total, label = "Progress", showPercentage = true }) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${percentage}%` }} />
            </div>
            {showPercentage && (
                <span className={styles.percentage}>
                    {Math.round(percentage)}% • {completed}/{total}
                </span>
            )}
        </div>
    );
}

export function CourseProgressCard({ course, completed, total }) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h3>{course.name}</h3>
                <span className={styles.badge}>{Math.round(percentage)}%</span>
            </div>
            <ProgressBar completed={completed} total={total} label="" showPercentage={false} />
            <p className={styles.meta}>
                {completed} of {total} items completed
            </p>
        </div>
    );
}
