import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { cookies } from "next/headers";
import {
    QuizDisplay,
    UserCard,
    QuizInput,
    Card,
} from "@/app/components/client";
import { canRead, useUser } from "@/lib/auth";
import { serializeOne } from "@/lib/db";
import { getQuizzesById } from "@/lib/db/helpers";

export default async function QuizPage({ params }) {
    const { id } = params;

    const quiz = (await getQuizzesById({ id }))[0];

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!canRead(quiz, user)) {
        return redirect("/quizzes");
    }

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                Created By: <UserCard user={quiz.creator} />
                <div>
                    <p>Contributors:</p>
                    <ul>
                        {quiz.contributors.map((c) => (
                            <li key={c.id}>{c.username}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <section>
                <QuizDisplay quiz={serializeOne(quiz)} />
            </section>
            <section>
                <Card title={"Edit Quiz Question"}>
                    <QuizInput quiz={serializeOne(quiz)} />
                </Card>
            </section>
        </main>
    );
}
