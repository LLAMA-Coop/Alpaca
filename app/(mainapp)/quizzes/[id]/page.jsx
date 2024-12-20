import {
  jsonObject,
  permissionsDefaultColumns,
  userDefaultColumns,
} from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import styles from "@main/page.module.css";
import { cookies } from "next/headers";
import { QuizDisplay } from "@client";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export default async function QuizPage({ params }) {
  const { id } = params;

  const quiz = await db
    .selectFrom("quizzes")
    .selectAll()
    .select(({ selectFrom }) => [
      selectFrom("resource_permissions as rp")
        .select(
          jsonObject({
            list: permissionsDefaultColumns,
            table: "rp",
          })
        )
        .whereRef("rp.resourceId", "=", "quizzes.id")
        .where("rp.resourceType", "=", "quiz")
        .as("permissions"),
      selectFrom("users")
        .select(
          jsonObject({
            list: userDefaultColumns,
            table: "users",
          })
        )
        .whereRef("users.id", "=", "quizzes.createdBy")
        .as("creator"),
    ])
    .where("id", "=", id)
    .executeTakeFirst();

  const user = await useUser({ token: cookies().get("token")?.value });
  if (!user) redirect(`/login?next=/quizzes/${id}`);

  if (
    !quiz ||
    (!quiz.permissions.allRead && !quiz.permissions.read.includes(user.id))
  ) {
    redirect("/quizzes");
  }

  quiz.creator = JSON.parse(quiz.creator);

  return (
    <main className={styles.main}>
      <header>
        <h1>
          Quiz by {quiz.creator.username}
          <br />
          {quiz.prompt}
        </h1>
      </header>

      <section>
        <QuizDisplay quiz={quiz} />
      </section>
    </main>
  );
}
