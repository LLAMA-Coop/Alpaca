import { getPermittedResources } from "@/lib/db/helpers";
import styles from "@/app/(mainapp)/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { DailyTrain } from "@client";
import Link from "next/link";
import shuffleQuizzes from "@/lib/shuffleQuizzes";

export default async function DailyPage() {
  const user = await useUser({ token: (await cookies()).get("token")?.value });

  const { quizzes } = await getPermittedResources({
    userId: user ? user.id : undefined,
    withQuizzes: true,
  });

  const sortedQuizzes = shuffleQuizzes(quizzes);

  return (
    <main className={styles.main}>
      <header>
        <h1>Daily Train</h1>

        <p>
          Daily Training is a spaced repetition system that helps you remember
          information from your notes and sources.
        </p>
      </header>

      <section>
        <h2>How it works</h2>

        <p>
          The Daily Train page is where you can practice on the quiz questions.
        </p>

        <p>
          When you get a quiz question correct, it levels up, and you do not see
          it again until later. Say you achieve level 7 with a quiz question
          when you get it right today. That quiz question will not appear in
          Daily Training for another 7 days.
        </p>

        <p>
          But if you get a quiz question wrong, you go down one level, and you
          have to try to get it right again before it disappears from Daily
          Training.
        </p>
      </section>

      <section>
        <h2>Ready to test your knowledge?</h2>

        {user ? (
          <DailyTrain quizzes={sortedQuizzes} />
        ) : (
          <p>
            Please{" "}
            <Link className="link" href="/login">
              log in
            </Link>{" "}
            to start training
          </p>
        )}
      </section>
    </main>
  );
}
