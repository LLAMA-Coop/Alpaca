import { QuizDisplay } from "@components/server";
import { QuizInput, Card, InputPopup } from "@components/client";
import styles from "@/app/Page.module.css";
import { serialize, serializeOne } from "@/lib/db";
import Source from "@models/Source";
import Quiz from "@models/Quiz";
import Note from "@models/Note";
import { useUser, canEdit } from "@/lib/auth";

export default async function QuizzesPage() {
    const sources = serialize(await Source.find());
    const quizzes = serialize(await Quiz.find());
    const notes = serialize(await Note.find());
    const user = serializeOne(await useUser());

    return (
        <main className={styles.main}>
            <h2>Quiz Cards</h2>

            {quizzes.length > 0 && (
                <section>
                    <h3>Your quiz cards</h3>

                    <ol className={styles.listGrid}>
                        {quizzes.map((quiz) => (
                            <li key={quiz.id}>
                                <QuizDisplay
                                    quiz={quiz}
                                    canClientCheck={true}
                                />
                                {user && canEdit(quiz, user._id) && (
                                    <InputPopup
                                        type="quiz"
                                        availableNotes={notes}
                                        availableSources={sources}
                                        resource={serializeOne(quiz)}
                                    />
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section>
                <h3>Create new quiz</h3>

                <QuizInput availableSources={sources} availableNotes={notes} />
            </section>
        </main>
    );
}
