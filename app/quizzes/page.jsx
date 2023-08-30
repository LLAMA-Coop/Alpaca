import { useUser, canEdit, queryReadableResources } from "@/lib/auth";
import { QuizInput, InputPopup } from "@components/client";
import { serialize, serializeOne } from "@/lib/db";
import { QuizDisplay } from "@components/server";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
// import Group from "../api/models/Group";
// import User from "../api/models/User";
// import Source from "@models/Source";
// import Quiz from "@models/Quiz";
// import Note from "@models/Note";
import { Group, User, Source, Quiz, Note } from "@mneme_app/database-models";

export default async function QuizzesPage({ searchParams }) {
    const user = serializeOne(await useUser());
    User.populate(user, ["groups", "associates"]);
    const query = queryReadableResources(user);

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

    const sources = serialize(await Source.find(query));
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
                    <h3>Available Quiz Cards</h3>

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
