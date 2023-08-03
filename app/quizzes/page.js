import { QuizDisplay } from '@/app/components/server';
import { QuizInput } from '@/app/components/client';
import Source from '@/app/api/models/Source';
import styles from '@/app/Page.module.css';
import Note from '@/app/api/models/Note';
import Quiz from '@/app/api/models/Quiz';

const sources = await Source.find();
const notes = await Note.find();
const quizzes = await Quiz.find();

export default function QuizzesPage() {
    const availableSources = sources.map((src) => {
        return {
            _id: src._id.toString(),
            title: src.title,
            url: src.url,
        };
    });

    const availableNotes = notes.map((note) => {
        return {
            _id: note._id.toString(),
            text: note.text,
        };
    });

    return (
        <main className={styles.main}>
            <h2>Quiz Cards</h2>

            {quizzes.length > 0 && (
                <section>
                    <h3>Your quiz cards</h3>

                    <ol className={styles.listGrid}>
                        {quizzes.map((quiz) => {
                            const quizForClient = JSON.parse(JSON.stringify(quiz));
                            return (
                                <li key={quiz._id}>
                                    <QuizDisplay
                                        quiz={quizForClient}
                                        canClientCheck={true}
                                    />
                                </li>
                            );
                        })}
                    </ol>
                </section>
            )}

            <section>
                <h3>Create new quizz</h3>

                <QuizInput
                    isEditing={false}
                    availableSources={availableSources}
                    availableNotes={availableNotes}
                />
            </section>
        </main>
    );
}
