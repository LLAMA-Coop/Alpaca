import { getQuizzes } from "@/app/actions/getQuizzes";
import styles from "@main/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Quizzes from "./Quizzes";

const INITIAL_NUMBER_OF_QUIZZES = 20;

export default async function QuizzesPage({ searchParams }) {
    const user = await useUser({ token: cookies().get("token")?.value });
    const tag = searchParams.tag;

    const { quizzes, hasMore } = await getQuizzes({
        tag,
        user,
        offset: 0,
        limit: INITIAL_NUMBER_OF_QUIZZES,
    });

    return (
        <main className={styles.main}>
            <header>
                <h1>Quiz Cards</h1>

                <p>
                    A quiz is a question that challenges your understanding and recall of
                    information from a source or note.
                    <br />
                    {user
                        ? `These are the quizzes that are publicly viewable, as well as the ones you made.`
                        : `You are only viewing the publicly available quizzes.
                           Log in to see quizzes available to you.`}
                </p>
            </header>

            <Quizzes
                user={user}
                more={hasMore}
                initialQuizzes={quizzes}
            />
        </main>
    );
}
