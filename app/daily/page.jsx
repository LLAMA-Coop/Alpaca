import styles from "@/app/page.module.css";
import DailyTrain from "../components/train/dailyTrain";
import { useUser, queryReadableResources } from "@/lib/auth";
import { Quiz, User } from "../api/models";
import { serialize } from "@/lib/db";

export default async function DailyPage({ searchParams }) {
    const user = await useUser();
    User.populate(user, ["groups", "associates"]);
    const query = queryReadableResources(user);

    const userQuizzes = user?.quizzes;
    const allQuizzes = await Quiz.find(query);
    const quizzes = serialize(
        allQuizzes.filter((q) => {
            const quizInUser = userQuizzes?.find(
                (quiz) => quiz.quizId === q._id.toString(),
            );
            if (!quizInUser) return true;
            const hidden = new Date(quizInUser.hiddenUntil);
            return hidden.getTime() <= Date.now();
        }),
    );

    return (
        <main className={styles.main}>
            <h2>Ready to test your knowledge?</h2>

            {user ? (
                <DailyTrain quizzes={quizzes} />
            ) : (
                <p>Please log in to start training</p>
            )}
        </main>
    );
}
