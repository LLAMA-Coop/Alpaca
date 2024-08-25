import { NoteDisplay, SourceDisplay } from "@server";
import { QuizDisplay, UserCard } from "@client";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { InviteUser } from "@client";
import { useUser } from "@/lib/auth";
import {
    getGroup,
    getPermittedNotes,
    getPermittedQuizzes,
    getPermittedSources,
} from "@/lib/db/helpers";

export default async function GroupPage({ params }) {
    const { id } = params;
    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) {
        redirect("/groups/");
    }

    const group = await getGroup({ id, userId: user.id });
    if (!group) return redirect("/groups");
    const groupUser = group.members.find((x) => x.id === user.id);
    user.role = groupUser ? groupUser.role : undefined;

    if (
        !group.isPublic &&
        group.members.find((x) => x.id === user.id) == undefined
    ) {
        return redirect("/groups");
    }

    const quizzes = await getPermittedQuizzes(user.id);
    const notes = await getPermittedNotes(user.id);
    const sources = await getPermittedSources(user.id);

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>{group.name}</h2>
                <p title="Group description">{group.description}</p>
            </div>

            <section>
                <h3>Members</h3>

                <div className="paragraph">
                    <p>
                        All members are able to associate resources (Quiz
                        questions, Notes, and Sources) with the group.
                        <br />
                        Some resources will be restricted to admins.
                    </p>
                </div>

                <div>
                    {group.members.length > 0 && (
                        <ol className={styles.listGrid}>
                            {group.members.map((user) => (
                                <li key={user.id}>
                                    <UserCard
                                        user={user}
                                        isOwner={user.role === "owner"}
                                        isAdmin={user.role === "administrator"}
                                    />
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                {user &&
                    (user.role === "owner" ||
                        user.role === "administrator") && (
                        <InviteUser groupId={id} />
                    )}
            </section>

            <section>
                <h3>Quiz Questions</h3>
                {quizzes.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {quizzes.map((quiz) => (
                            <QuizDisplay key={quiz._id} quiz={quiz} />
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No quiz questions are associated with this group</p>
                    </div>
                )}
            </section>

            <section>
                <h3>Notes</h3>
                {notes.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {notes.map((note) => (
                            <NoteDisplay key={note._id} note={note} />
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No notes are associated with this group</p>
                    </div>
                )}
            </section>

            <section>
                <h3>Sources</h3>
                {sources.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {sources.map((source) => (
                            <SourceDisplay key={source._id} source={source} />
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No sources are associated with this group</p>
                    </div>
                )}
            </section>
        </main>
    );
}
