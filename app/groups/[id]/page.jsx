import { Source, Note, Quiz, Group } from "@models";
import { NoteDisplay, SourceDisplay } from "@server";
import { serialize, serializeOne } from "@/lib/db";
import { QuizDisplay, UserCard } from "@client";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { InviteUser } from "@client";
import { useUser } from "@/lib/auth";

export default async function GroupPage({ params }) {
    const { id } = params;

    const group = serializeOne(await Group.findById(id).populate("users"));
    if (!group) return redirect("/groups");

    const user = serializeOne(
        await useUser({ token: cookies().get("token")?.value }),
    );
    if (!group.isPublic && !user?.groups?.includes(id)) {
        return redirect("/groups");
    }

    const permissionsQuery = {
        $or: [
            { "permissions.groupsRead": { $in: [group._id] } },
            { "permissions.groupsWrite": { $in: [group._id] } },
        ],
    };

    const quizzes = serialize(await Quiz.find(permissionsQuery));
    const notes = serialize(await Note.find(permissionsQuery));
    const sources = serialize(await Source.find(permissionsQuery));

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
                    {group.users.length > 0 && (
                        <ol className={styles.listGrid}>
                            {group.users.map((user) => (
                                <li key={user.id}>
                                    <UserCard
                                        user={user}
                                        isOwner={user.id === group.owner}
                                        isAdmin={group.admins.includes(user.id)}
                                    />
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                {user &&
                    (user.id === group.owner ||
                        group.admins.includes(user.id)) && (
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
