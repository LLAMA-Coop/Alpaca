import { getPermittedResources } from "@/lib/db/helpers";
import { MasoneryList, QuizDisplay } from "@client";
import styles from "@main/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default async function QuizzesPage({ searchParams }) {
    const user = await useUser({ token: cookies().get("token")?.value });

    const page = Number(searchParams["page"] ?? 1);
    const amount = Number(searchParams["amount"] ?? 10);

    if (page < 1 || amount < 1) {
        return redirect(
            `/quizzes?page=${page < 1 ? 1 : page}&amount=${
                amount < 1 ? 10 : amount
            }`,
        );
    }

    const { quizzes } = await getPermittedResources({
        withQuizzes: true,
        userId: user?.id,
    });

    const hasMore = false;

    if (page > 1 && quizzes.length === 0) {
        return redirect("/quizzes?page=1&amount=" + amount);
    }

    return (
        <main className={styles.main}>
            <header>
                <h1>Quiz Cards</h1>

                <p>
                    A quiz is a question that challenges your understanding and
                    recall of information from a source or note.
                    <br />
                    {user
                        ? `These are the quizzes that are publicly viewable, as well as the ones you made.`
                        : `You are only viewing the publicly available quizzes.
                           Log in to see quizzes available to you.`}
                </p>
            </header>

            <section>
                {quizzes.length > 0 ? (
                    <>
                        <h2>Available Quiz Questions</h2>

                        <MasoneryList>
                            {quizzes.map((quiz) => (
                                <li key={quiz.id}>
                                    <QuizDisplay quiz={quiz} />
                                </li>
                            ))}
                        </MasoneryList>

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
                    </>
                ) : (
                    <div className={styles.noResults}>
                        <Image
                            src="/assets/no-results.svg"
                            alt="No quizzes"
                            height={400}
                            width={400}
                        />

                        <p>
                            Hey, we searched high and low, but we couldn't find
                            any quizzes.
                            <br />
                            Maybe you should try again later or create your own
                            quizzes.
                        </p>

                        <Link className="button primary" href="/create">
                            Create a quiz
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
