import { QuizDisplay } from "@components/server";
import { QuizInput } from "@components/client";
import styles from "@/app/Page.module.css";
import { serialize } from "@/lib/db";
import Source from "@models/Source";
import Quiz from "@models/Quiz";
import Note from "@models/Note";

export default async function QuizzesPage() {
    const sources = serialize(await Source.find());
    const quizzes = serialize(await Quiz.find());
    const notes = serialize(await Note.find());

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
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section>
                <h3>Create new quizz</h3>

                <QuizInput
                    isEditing={false}
                    availableSources={sources}
                    availableNotes={notes}
                />
            </section>
        </main>
    );
}
