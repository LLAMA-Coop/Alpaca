import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { Quiz } from "@/app/api/models";
import { cookies } from "next/headers";
import {
    QuizDisplay,
    UserCard,
    QuizInput,
    Card,
} from "@/app/components/client";
import { canRead, useUser } from "@/lib/auth";
import { serializeOne } from "@/lib/db";

export default async function QuizPage({ params }) {
    const { id } = params;

    const quiz = await Quiz.findById(id);

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!canRead(quiz, user)) {
        return redirect("/quizzes");
    }

    await quiz.populate("createdBy");
    await quiz.populate("contributors");

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                Created By: <UserCard user={serializeOne(quiz.createdBy)} />
                <div>
                    <p>Contributors:</p>
                    <ul>
                        {quiz.contributors.map((c) => (
                            <li key={c._id}>{c.username}</li>
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
