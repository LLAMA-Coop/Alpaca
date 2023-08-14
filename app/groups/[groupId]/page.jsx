import { UserCard } from "@components/client";
import styles from "@/app/Page.module.css";
import { redirect } from "next/navigation";
import { serialize, serializeOne } from "@/lib/db";
import { useUser } from "@/lib/auth";
import Group from "@models/Group";
import Quiz from "@models/Quiz";
import Note from "@models/Note";
import Source from "@models/Source";
import { QuizDisplay } from "@/app/components/server";

export default async function GroupPage({ params }) {
    const groupId = params.groupId;

    const group = serializeOne(
        await Group.findById(groupId)
            .populate("users")
            .populate("admins")
            .populate("owner"),
    );
    if (!group) return redirect("/groups");

    const user = serializeOne(await useUser());
    if (!group.isPublic && !user?.groups?.includes(groupId)) {
        return redirect("/groups");
    }

    const permissionsQuery = {
        $or: [
            { "permissions.groupsRead": { $in: group._id } },
            { "permissions.groupsWrite": { $in: group._id } },
        ],
    };

    const quizzes = serialize(await Quiz.find(permissionsQuery));
    const notes = serialize(await Note.find(permissionsQuery));
    const sources = serialize(await Source.find(permissionsQuery));

    return (
        <main className={styles.main}>
            <section>
                <h2>{group.name}</h2>
                <p>{group.description}</p>
            </section>

            <section>
                <h3>Members</h3>

                <div>
                    <h4>Owner</h4>
                    <UserCard user={group.owner} />
                </div>

                <div>
                    <h4>Users</h4>
                    {group.users.length > 0 && (
                        <ol className={styles.listGrid}>
                            {group.users.map((user) => {
                                return (
                                    <li key={user.id}>
                                        <UserCard user={user} />
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>

                <div>
                    <h4>Administrators</h4>
                    {group.admins.length > 0 && (
                        <ol className={styles.listGrid}>
                            {group.admins.map((admin) => {
                                return (
                                    <li key={admin.id}>
                                        <UserCard user={admin} />
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>
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
                    <div>No quiz questions are associated with this group</div>
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
                    <div>No notes are associated with this group</div>
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
                    <div>No sources are associated with this group</div>
                )}
            </section>
        </main>
    );
}
