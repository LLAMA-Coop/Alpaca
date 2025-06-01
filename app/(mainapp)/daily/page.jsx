import { getPermittedResources, getRelationships } from "@/lib/db/helpers";
import styles from "@/app/(mainapp)/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { DailyTrain } from "@client";
import Link from "next/link";
import shuffleQuizzes from "@/lib/shuffleQuizzes";

export default async function DailyPage() {
  const user = await useUser({ token: (await cookies()).get("token")?.value });

  const resourcesObject = await getPermittedResources({
    userId: user ? user.id : undefined,
    withQuizzes: true,
  });
  const { quizzes } = resourcesObject;
  const sortedQuizzes = shuffleQuizzes(quizzes);

  const relationships = await getRelationships();
  const includeRef = relationships.filter((x) => !!x.includeReference);
  
  function pushToList(rel, type) {
    const resourceList = [
      {
        name: "sources",
        title: "Sources",
        singular: "source",
        description:
          "A source is a record of a resource such as a book, website, or video tutorial, that you can cite for your notes or quiz questions.",
      },
      {
        name: "notes",
        title: "Notes",
        singular: "note",
        description:
          "A note is a record of your thoughts, ideas, or summaries of a source. You can use notes to create quiz questions or to help you study.",
      },
      {
        name: "quizzes",
        title: "Quizzes",
        singular: "quiz",
        description:
          "A quiz is a question that challenges your understanding and recall of information from a source or note.",
      },
      {
        name: "courses",
        title: "Courses",
        singular: "course",
        description:
          "A course is a collection of notes, quizzes, and sources that are related to a specific topic or subject.",
      },
    ];
    if (rel.AType === type) {
      quizzes
        .filter((x) => x.id === rel.A)
        .forEach((x) => {
          const listType = resourceList.find(
            (x) => x.singular === rel.BType
          ).name;
          if (!x[listType]) x[listType] = [];
          if (!x[listType].includes(rel.B)) x[listType].push(rel.B);
        });
    }

    if (rel.BType === type) {
      quizzes
        .filter((x) => x.id === rel.B)
        .forEach((x) => {
          const listType = resourceList.find(
            (x) => x.singular === rel.AType
          ).name;
          if (!x[listType]) x[listType] = [];
          if (!x[listType].includes(rel.A)) x[listType].push(rel.A);
        });
    }
  }

  relationships.forEach((rel) => {
    includeRef.forEach((x) => {
      if (
        x.AType !== "course" &&
        x.AType === rel.AType &&
        rel.BType !== "course" &&
        x.A === rel.A
      ) {
        const newRel = {
          A: x.B,
          AType: "course",
          B: rel.B,
          BType: rel.BType,
        };
        relationships.push(newRel);
      }
      // if rel.BType source rel.B 1,
      if (
        x.AType !== "course" &&
        x.AType === rel.BType &&
        rel.BType !== "course" &&
        x.A === rel.B
      ) {
        const newRel = {
          A: rel.A,
          AType: rel.AType,
          B: x.B,
          BType: "course",
        };
        relationships.push(newRel);
      }

      if (x.BType !== "course" && x.BType === rel.BType && x.B === rel.B) {
        const newRel = {
          AType: rel.BType,
          A: rel.B,
          BType: "course",
          B: x.A,
        };
        relationships.push(newRel);
      }
    });
    pushToList(rel, "quiz");
  });

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
