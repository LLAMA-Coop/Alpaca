import { NoteDisplay, QuizDisplay, SourceDisplay } from "@components/server";
import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { serializeOne } from "@/lib/db";
import { useUser } from "@/lib/auth";
// import { Source, Quiz, Note } from "@mneme_app/database-models";
import { Source, Note, Quiz } from "@/app/api/models";
import InviteAssociate from "@/app/components/inviteAssociate";

export default async function DashboardPage() {
    const user = await useUser();
    user.populate("associates");
    if (!user) return redirect("/login");

    const sources = await Source.find({ contributors: user.id });
    const quizzes = await Quiz.find({ contributors: user.id });
    const notes = await Note.find({ contributors: user.id });

    return (
        <main className={styles.main}>
            <h2>Dashboard</h2>

            <section>
                <h3>Your Profile</h3>

                <div className="paragraph">
                    <p>Hello user, here's your account!</p>

                    <p>
                        Username: {user.username}
                        <br />
                        Created At:{" "}
                        {new Intl.DateTimeFormat("en-Us", {}).format(
                            new Date(user.createdAt),
                        )}
                    </p>
                </div>
            </section>

            <section>
                <h3>Your Contributions</h3>

                <h4>Quiz Questions</h4>
                {quizzes.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {quizzes.map((quiz) => (
                            <li key={quiz._id}>
                                <QuizDisplay quiz={serializeOne(quiz)} />
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No quiz questions</p>
                    </div>
                )}

                <h4>Notes</h4>
                {notes.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {notes.map((note) => (
                            <li key={note._id}>
                                <NoteDisplay note={serializeOne(note)} />
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No notes</p>
                    </div>
                )}

                <h4>Sources</h4>
                {sources.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {sources.map((source) => (
                            <li key={source._id}>
                                <SourceDisplay source={serializeOne(source)} />
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No sources</p>
                    </div>
                )}
            </section>

            <section>
                <h3>Your Associates</h3>
                {user.associates.length > 0 && user.associates.map(associate => {
                    console.log(associate)
                })}

                {user.associates.length === 0 && (
                    <p>You have no associates</p>
                )}

                <InviteAssociate />
            </section>
        </main>
    );
}
