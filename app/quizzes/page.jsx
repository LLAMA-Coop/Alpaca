import { QuizDisplay } from "@components/server";
import { QuizInput, InputPopup } from "@components/client";
import styles from "@/app/page.module.css";
import { serialize, serializeOne } from "@/lib/db";
import Source from "@models/Source";
import Quiz from "@models/Quiz";
import Note from "@models/Note";
import { useUser, canEdit, queryReadableResources } from "@/lib/auth";
import User from "../api/models/User";
import Group from "../api/models/Group";

export default async function QuizzesPage() {
    const user = await useUser();
    User.populate(user, ["groups", "associates"]);
    const query = queryReadableResources(user);

    const sources = serialize(await Source.find(query));
    const quizzes = serialize(await Quiz.find(query));
    const notes = serialize(await Note.find(query));
    const publicUsers = await User.find({ isPublic: true });
    const availableUsers = serialize(
        user?.hasOwnProperty("associates") && user?.associates.length > 0
            ? [...user.associates, ...publicUsers]
            : [...publicUsers],
    );
    const publicGroups = await Group.find({ isPublic: true });
    const availableGroups = serialize(
        user?.hasOwnProperty() && user?.groups.length > 0
            ? [...user.groups, ...publicGroups]
            : [...publicGroups],
    );

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
                                        availableUsers={availableUsers}
                                        availableGroups={availableGroups}
                                        resource={serializeOne(quiz)}
                                    />
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            {user && (
                <section>
                    <h3>Create new quiz</h3>

                    <QuizInput
                        availableSources={sources}
                        availableNotes={notes}
                        availableUsers={availableUsers}
                        availableGroups={availableGroups}
                    />
                </section>
            )}
        </main>
    );
}
