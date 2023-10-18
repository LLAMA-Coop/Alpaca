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
                (quiz) => quiz.quizId.toString() === q._id.toString(),
            );
            if (!quizInUser) return true;
            const hidden = new Date(quizInUser.hiddenUntil);
            return hidden.getTime() <= Date.now();
        }),
    );

    return (
        <main className={styles.main}>
            <section className="paragraph">
                <h2>Daily Train</h2>
                <p>
                    The Daily Train page is where you can practice on the quiz
                    questions.
                </p>
                <p>
                    When you get a quiz question correct, it levels up, and you
                    do not see it again until later. Say you achieve level 7
                    with a quiz question when you get it right today. That quiz
                    question will not appear in Daily Training for another 7
                    days.
                </p>
                <p>
                    But if you get a quiz question wrong, you go down one level,
                    and you have to try to get it right again before it
                    disappears from Daily Training.
                </p>
            </section>

            <section>
                <h2>Ready to test your knowledge?</h2>
                {user ? (
                    <DailyTrain quizzes={quizzes} />
                ) : (
                    <p>Please log in to start training</p>
                )}
            </section>
        </main>
    );
}
