import styles from "@/app/(mainapp)/page.module.css";
import { cookies } from "next/headers";
import {
  QuizDisplay,
  UserCard,
  QuizInput,
  Card,
} from "@/app/components/client";
import {
  jsonObject,
  permissionsDefaultColumns,
  userDefaultColumns,
} from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export default async function QuizPage({ params }) {
  const { id } = params;

  const user = await useUser({ token: cookies().get("token")?.value });
  if (!user) redirect("/login");

  const quiz = await db
    .selectFrom("quizzes")
    .selectAll()
    .select(({ selectFrom }) => [
      selectFrom("resource_permissions as rp")
        .select(jsonObject({ list: permissionsDefaultColumns, table: "rp" }))
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

  if (!quiz.permissions.allRead && !quiz.permissions.read.includes(user.id)) {
    redirect("/quizzes");
  }

  return (
    <main className={styles.main}>
      <div className={styles.titleBlock}>
        Created By: <UserCard user={quiz.creator} />
      </div>
      <section>
        <QuizDisplay quiz={quiz} />
      </section>
      <section>
        <Card title={"Edit Quiz Question"}>
          <QuizInput quiz={quiz} />
        </Card>
      </section>
    </main>
  );
}
