import { CourseInput } from "../components/Course/CourseInput";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import styles from "@/app/page.module.css";
import { CourseDisplay } from "../components/Course/CourseDisplay";
import { InputPopup } from "../components/client";
import { serializeOne } from "@/lib/db";
import { getPermittedCourses } from "@/lib/db/helpers";

export default async function CoursesPage({ searchParams }) {
    const user = await useUser({ token: cookies().get("token")?.value });
    const courses = user ? await getPermittedCourses(user.id) : [];

    return (
        <main className={styles.main}>
            {courses.length > 0 && (
                <section>
                    <h3>Available Courses</h3>

                    <ol className={styles.listGrid}>
                        {courses.map((course) => {
                            const isCreator =
                                user &&
                                ((course.createdBy &&
                                    course.createdBy === user.id) ||
                                    (course.creator &&
                                        course.creator.id === user.id));
                            const canEdit =
                                isCreator || course.permissionType === "write";
                            const canRead =
                                canEdit || course.permissionType === "read";

                            return (
                                <li key={course._id}>
                                    <CourseDisplay
                                        course={course}
                                        canRead={canRead}
                                    />

                                    {canEdit && (
                                        <InputPopup
                                            type="course"
                                            resource={serializeOne(course)}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </section>
            )}

            {user && (
                <section>
                    <h3>Create new course</h3>

                    <CourseInput />
                </section>
            )}
        </main>
    );
}
