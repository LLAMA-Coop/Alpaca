"use client";

import styles from "./CourseStructure.module.css";
import { ProgressBar } from "../Progress/ProgressBar";

export function ModuleCard({ module, items = [], completed = 0 }) {
    const percentage = items.length > 0 ? (completed / items.length) * 100 : 0;
    const color = percentage === 100 ? "completed" : percentage >= 50 ? "progress" : "pending";

    return (
        <div className={`${styles.module} ${styles[color]}`}>
            <div className={styles.moduleHeader}>
                <h4>{module.title}</h4>
                <span className={styles.stat}>{completed}/{items.length}</span>
            </div>
            {module.description && <p className={styles.description}>{module.description}</p>}
            <ProgressBar completed={completed} total={items.length} label="" showPercentage={false} />
            <div className={styles.items}>
                {items.map((item, idx) => (
                    <div key={idx} className={`${styles.item} ${item.completed ? styles.completed : ""}`}>
                        <span className={styles.itemIcon}>
                            {item.completed ? "✓" : item.type === "quiz" ? "?" : "📝"}
                        </span>
                        <span className={styles.itemName}>{item.title}</span>
                        {item.type && <span className={styles.itemType}>{item.type}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CourseStructure({ course, modules = [], items = [] }) {
    const totalItems = items.length;
    const completedItems = items.filter((i) => i.completed).length;
    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return (
        <div className={styles.structure}>
            <div className={styles.header}>
                <h2>{course.name}</h2>
                {course.description && <p className={styles.courseDesc}>{course.description}</p>}
            </div>

            <div className={styles.overallProgress}>
                <div>
                    <p>Course Progress</p>
                    <ProgressBar
                        completed={completedItems}
                        total={totalItems}
                        label=""
                        showPercentage={true}
                    />
                </div>
            </div>

            <div className={styles.modules}>
                {modules.length > 0 ? (
                    modules.map((module) => {
                        const moduleItems = items.filter((i) => i.moduleId === module.id);
                        const moduleCompleted = moduleItems.filter((i) => i.completed).length;
                        return (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                items={moduleItems}
                                completed={moduleCompleted}
                            />
                        );
                    })
                ) : (
                    <div className={styles.noModules}>
                        <p>This course doesn't have modules yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
