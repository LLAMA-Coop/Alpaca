import styles from "@/app/(mainapp)/page.module.css";
import { cookies } from "next/headers";
import {
    QuizDisplay,
    UserCard,
    QuizInput,
    Card,
} from "@/app/components/client";
import { useUser } from "@/lib/auth";
import { getPermittedResources } from "@/lib/db/helpers";

export default async function QuizPage({ params }) {
    const { id } = params;

    const user = await useUser({ token: cookies().get("token")?.value });

    const resources = await getPermittedResources({
        withQuizzes: true,
        userId: user?.id,
        selectById: id
    })

    const quiz = resources.quizzes[0]

    // console.log("RESOURCES QUIZ", resources, quiz);

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
