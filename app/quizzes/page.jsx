import { QuizDisplay } from "@components/server";
import { QuizInput, InputPopup } from "@components/client";
import styles from "@/app/Page.module.css";
import { serialize, serializeOne } from "@/lib/db";
import Source from "@models/Source";
import Quiz from "@models/Quiz";
import Note from "@models/Note";
import { useUser, canEdit, queryReadableResources } from "@/lib/auth";

export default async function QuizzesPage() {
    const user = await useUser();
    const query = queryReadableResources(user);

    const sources = serialize(await Source.find(query));
    const quizzes = serialize(await Quiz.find(query));
    const notes = serialize(await Note.find(query));
    console.log("sources", sources);
    console.log("notes", notes);

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
                                {user && canEdit(quiz, serializeOne(user)) && (
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
