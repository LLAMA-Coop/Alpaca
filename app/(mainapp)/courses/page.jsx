import { getPermittedResources } from "@/lib/db/helpers";
import { InputPopup, CourseDisplay } from "@client";
import styles from "@main/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Link from "next/link";

export default async function CoursesPage() {
    const user = await useUser({ token: cookies().get("token")?.value });

    const { courses } = await getPermittedResources({
        withCourses: true,
        userId: user?.id,
    });

    return (
        <main className={styles.main}>
            <header>
                <h1>Courses</h1>

                <p>
                    A course is a collection of sources, notes, and quizzes that
                    are organized around a particular topic. You can create a
                    course to help you study for a test, prepare for a
                    presentation, or learn a new skill. Or you can join a course
                    that someone else has created to learn from their research.
                </p>
            </header>

            <section>
                <h2>Available Courses</h2>

                <ol className={styles.listGrid}>
                    {courses.map((course) => {
                        const isCreator = user && course.creator.id === user.id;
                        const canWrite = isCreator || course.allCanWrite;

                        return (
                            <li key={course._id}>
                                <CourseDisplay course={course} />

                                {canWrite && (
                                    <InputPopup
                                        type="course"
                                        resource={course}
                                    />
                                )}
                            </li>
                        );
                    })}

                    {courses.length === 0 && (
                        <p className={styles.noContent}>
                            Oh, that's awkward. There are no courses available.
                            <br />
                            <Link className="link" href="/register">
                                Register
                            </Link>{" "}
                            and create your own course to invite others to join
                            and learn with you.
                        </p>
                    )}
                </ol>
            </section>
        </main>
    );
}
