import styles from "@/app/(mainapp)/page.module.css";
import { CourseCard } from "@/app/components/Course/CourseCard";
import Link from "next/link";

async function getPublicCourses() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/course/public`, {
            cache: "no-store",
        });

        if (!res.ok) {
            return [];
        }

        return await res.json();
    } catch (error) {
        console.error("Failed to fetch public courses:", error);
        return [];
    }
}

export async function AvailableCourses() {
    const courses = await getPublicCourses();

    if (!courses || courses.length === 0) {
        return (
            <section className={styles.coursesSection}>
                <h2>Available Courses</h2>
                <p className={styles.sectionDescription}>
                    Explore our collection of courses to enhance your learning
                </p>
                <div className={styles.noCoursesMessage}>
                    <p>Explore courses or create your own to get started on your learning journey.</p>
                    <div className={styles.noCoursesActions}>
                        <Link href="/courses" className={styles.buttonSecondary}>
                            <span className={styles.buttonText}>Browse All Courses</span>
                        </Link>
                        <Link href="/create" className={styles.buttonSecondary}>
                            <span className={styles.buttonText}>Create a Course</span>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.coursesSection}>
            <h2>Available Courses</h2>
            <p className={styles.sectionDescription}>
                Explore our collection of courses to enhance your learning
            </p>
            <div className={styles.courseGrid}>
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
            <div className={styles.coursesFooter}>
                <Link href="/courses" className={styles.buttonSecondary}>
                    <span className={styles.buttonText}>View All Courses</span>
                </Link>
            </div>
        </section>
    );
}
