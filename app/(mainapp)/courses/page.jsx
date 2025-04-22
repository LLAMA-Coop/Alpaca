import { getPermittedResources } from "@/lib/db/helpers";
import { CourseDisplay, MasoneryList } from "@client";
import styles from "@main/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/dist/server/api-utils";

export default async function CoursesPage({ searchParams }) {
    const user = await useUser({ token: cookies().get("token")?.value });

    const page = Number(searchParams["page"] ?? 1);
    const amount = Number(searchParams["amount"] ?? 10);

    if (page < 1 || amount < 1) {
        return redirect(`/sources?page=${page < 1 ? 1 : page}&amount=${amount < 1 ? 10 : amount}`);
    }

    const { courses } = await getPermittedResources({
        withCourses: true,
        userId: user?.id,
        limit: amount + 1,
        offset: (page - 1) * amount,
    });

    const hasMore = courses.length > amount;

    if (page > 1 && courses.length === 0) {
        return redirect("/courses?page=1&amount=" + amount);
    }

    return (
        <main className={styles.main}>
            <header>
                <h1>Courses</h1>

                <p>
                    A course is a collection of sources, notes, and quizzes that are organized
                    around a particular topic. You can create a course to help you study for a test,
                    prepare for a presentation, or learn a new skill. Or you can join a course that
                    someone else has created to learn from their research.
                </p>
            </header>

            <section>
                {courses.length > 0 ? (
                    <>
                        <h2>Available Courses</h2>

                        <MasoneryList>
                            {courses.map((course) => (
                                <li key={course.id}>
                                    <CourseDisplay course={course} />
                                </li>
                            ))}
                        </MasoneryList>

                        <div className={styles.paginationButtons}>
                            <Link
                                disabled={page <= 1}
                                className="button submit primary"
                                href={`/courses?page=${page - 1}&amount=${amount}`}
                            >
                                Previous page
                            </Link>

                            <Link
                                disabled={!hasMore}
                                className="button submit primary"
                                href={`/courses?page=${page + 1}&amount=${amount}`}
                            >
                                Next page
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className={styles.noResults}>
                        <Image
                            width={400}
                            height={400}
                            alt="No courses found"
                            src="/assets/no-results.svg"
                        />

                        <p>
                            Hey, we searched high and low, but we couldn't find any courses for you.
                            <br />
                            {user ? (
                                "Maybe you should try again later or create your own courses."
                            ) : (
                                <>
                                    You may find more when you{" "}
                                    <Link
                                        className="link"
                                        href="/login?next=/courses"
                                    >
                                        log in{" "}
                                    </Link>
                                    or{" "}
                                    <Link
                                        className="link"
                                        href="/register"
                                    >
                                        register
                                    </Link>
                                    .
                                </>
                            )}
                        </p>

                        <Link
                            href="/create"
                            className="button primary"
                        >
                            Create a course
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
