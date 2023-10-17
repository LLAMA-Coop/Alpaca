import { useUser, canEdit, queryReadableResources } from "@/lib/auth";
import { QuizInput, InputPopup } from "@components/client";
import { UserStats } from "../components/quiz/UserStats";
import { serialize, serializeOne } from "@/lib/db";
import { QuizDisplay } from "@components/server";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import Link from "next/link";
import htmlDate from "@/lib/htmlDate";
// import { Group, User, Source, Quiz, Note } from "@mneme_app/database-models";
import { Source, Note, Quiz, User, Group } from "@/app/api/models";

export default async function QuizzesPage({ searchParams }) {
    const user = await useUser();
    User.populate(user, ["groups", "associates"]);
    const query = queryReadableResources(user);

    let userQuizzes;
    if (user) {
        userQuizzes = user.quizzes;
    }

    const page = Number(searchParams["page"] ?? 1);
    const amount = Number(searchParams["amount"] ?? 10);
    if (page < 1 || amount < 1) {
        return redirect(
            `/quizzes?page=${page < 1 ? 1 : page}&amount=${
                amount < 1 ? 10 : amount
            }`,
        );
    }

    const quizzes = serialize(
        await Quiz.find(query)
            .limit(amount)
            .skip((page - 1) * amount),
    );

    const hasMore =
        (
            await Quiz.find(query)
                .limit(1)
                .skip((page - 1) * amount + amount)
        )?.length > 0;

    if (page > 1 && quizzes.length === 0) {
        return redirect("/quizzes?page=1&amount=" + amount);
    }

    return (
        <main className={styles.main}>
            <h2>Quiz Cards</h2>

            {quizzes.length > 0 && (
                <section>
                    <h3>Available Quiz Cards</h3>

                    <ol className={styles.listGrid}>
                        {quizzes.map((quiz) => {
                            const quizInUser = userQuizzes?.find(
                                (q) =>
                                    q.quizId.toString() === quiz._id.toString(),
                            );

                            return (
                                <li key={quiz.id}>
                                    <QuizDisplay
                                        quiz={quiz}
                                        canClientCheck={false}
                                    />
                                    {quizInUser && (
                                        <UserStats userQuizInfo={quizInUser} />
                                    )}
                                    {user &&
                                        canEdit(quiz, serializeOne(user)) && (
                                            <InputPopup
                                                type="quiz"
                                                resource={serializeOne(quiz)}
                                            />
                                        )}
                                </li>
                            );
                        })}
                    </ol>

                    <div className={styles.paginationButtons}>
                        {page > 1 ? (
                            <Link
                                className="button submit"
                                href={`/quizzes?page=${
                                    page - 1
                                }&amount=${amount}`}
                            >
                                Previous page
                            </Link>
                        ) : (
                            <button disabled className="button submit">
                                Previous page
                            </button>
                        )}

                        {hasMore ? (
                            <Link
                                className="button submit"
                                href={`/quizzes?page=${
                                    page + 1
                                }&amount=${amount}`}
                            >
                                Next page
                            </Link>
                        ) : (
                            <button disabled className="button submit">
                                Next page
                            </button>
                        )}
                    </div>
                </section>
            )}

            {user && (
                <section>
                    <h3>Create new quiz</h3>

                    <QuizInput />
                </section>
            )}
        </main>
    );
}
