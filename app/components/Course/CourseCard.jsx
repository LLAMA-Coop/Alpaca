import styles from "./CourseCard.module.css";
import Link from "next/link";
import { Users, BookOpen } from "lucide-react";

export function CourseCard({ course }) {
    if (!course) return null;

    return (
        <Link href={`/courses/${encodeURIComponent(course.name)}`} className={styles.card}>
            <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{course.name}</h3>
                <p className={styles.cardDescription}>{course.description}</p>

                <div className={styles.cardFooter}>
                    <div className={styles.infoTag}>
                        <Users size={16} />
                        <span>{course.enrollments || 0}</span>
                    </div>
                    <div className={styles.infoTag}>
                        <BookOpen size={16} />
                        <span>{course.resources || 0}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
