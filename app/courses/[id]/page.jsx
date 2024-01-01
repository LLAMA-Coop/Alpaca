import { CourseDisplay } from "@/app/components/Course/CourseDisplay";
import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { Course } from "@/app/api/models";
import { cookies } from "next/headers";
import { canRead } from "@/lib/auth";
import { useUser } from "@/lib/auth";

export default async function CoursePage({ params }) {
    const { id } = params;

    const course = await Course.findById(id)
        .populate("prerequisites.course")
        .populate("parentCourses");
    if (!course) return redirect("/groups");

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!canRead(course, user)) {
        return redirect("/groups");
    }

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>{course.name}</h2>
                <p>{course.description}</p>
            </div>

            {course.prerequisites.length > 0 && (
                <section>
                    <h3>Prerequisites</h3>
                    <ul>
                        {course.prerequisites.map((p) => {
                            return (
                                <li key={p.course.id}>
                                    <p>{p.averageLevelRequired}</p>
                                    <CourseDisplay course={p.course} />
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            {course.parentCourses.length > 0 && (
                <section>
                    <h3>Parent Courses</h3>
                    <ul>
                        {course.parentCourses.map((c) => {
                            return (
                                <li key={c.id}>
                                    <CourseDisplay course={c} />
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </main>
    );
}
