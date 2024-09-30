import { getPermittedResources } from "@/lib/db/helpers";
import { CourseDisplay, MasoneryList } from "@client";
import styles from "@main/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Image from "next/image";
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
          A course is a collection of sources, notes, and quizzes that are
          organized around a particular topic. You can create a course to help
          you study for a test, prepare for a presentation, or learn a new
          skill. Or you can join a course that someone else has created to learn
          from their research.
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
            </MasoneryList>{" "}
          </>
        ) : (
          <div className={styles.noResults}>
            <Image
              src="/assets/no-results.svg"
              alt="No courses found"
              height={400}
              width={400}
            />

            <p>
              Hey, we searched high and low, but we couldn't find any courses
              for you.
            </p>
            {user ? (
              <p>
                Maybe you should try again later or create your own sources.
              </p>
            ) : (
              <p>
                You may find more when you{" "}
                <Link className="link" href="/login">
                  log in
                </Link>{" "}
                or{" "}
                <Link className="link" href="/register">
                  register
                </Link>
              </p>
            )}

            <Link className="button primary" href="/create">
              Create a course
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
