import { redirect } from "next/navigation";
import styles from "../../page.module.css";
import { cookies } from "next/headers";
import { InviteUser } from "@client";
import { useUser } from "@/lib/auth";
import { UserCard } from "@client";
import { db } from "@/lib/db/db";
import { sql } from "kysely";

export default async function GroupPage(props) {
    const params = await props.params;
    const { publicId } = params;

    const user = await useUser({ token: (await cookies()).get("token")?.value });
    if (!user) redirect("/groups");

    const group = await db
        .selectFrom("groups")
        .select(({ selectFrom }) => [
            "id",
            "publicId",
            "name",
            "description",
            "isPublic",
            "icon",
            selectFrom("members as m")
                .innerJoin("users as u", "m.userId", "u.id")
                .select(
                    sql`JSON_ARRAYAGG(JSON_OBJECT(
                                'id', u.id,
                                'username', u.username,
                                'displayName', u.display_name,
                                'avatar', u.avatar
                            ))`,
                )
                .whereRef("m.groupId", "=", "groups.id")
                .as("members"),
        ])
        .where("publicId", "=", publicId)
        .where(({ eb, exists, or }) =>
            or([
                exists(
                    eb
                        .selectFrom("members")
                        .select("userId")
                        .where("userId", "=", user.id)
                        .whereRef("groupId", "=", "groups.id"),
                ),
                eb("isPublic", "=", 1),
            ]),
        )
        .executeTakeFirst();

    if (!group) redirect("/groups");

    const isOwner = group.members.some(
        (m) => m.id === user.id && m.role === "owner",
    );

    const isAdmin = group.members.some(
        (m) => m.id === user.id && m.role === "admin",
    );

    return (
        <main className={styles.main}>
            <header>
                <h1>{group.name}</h1>
                <p title="Group description">{group.description}</p>
            </header>

            <section>
                <h2>Members</h2>

                <div className="paragraph">
                    <p>
                        All members are able to associate resources (Quiz
                        questions, Notes, and Sources) with the group.
                        <br />
                        Some resources will be restricted to admins.
                    </p>
                </div>

                <ol className={styles.listGrid}>
                    {group.members.map((user) => (
                        <li key={user.id}>
                            <UserCard
                                user={user}
                                isOwner={user.role === "owner"}
                                isAdmin={user.role === "admin"}
                            />
                        </li>
                    ))}
                </ol>

                {(isOwner || isAdmin) && <InviteUser groupId={group.id} />}
            </section>

            <section>
                <h2>Quiz Questions</h2>

                {/* {quizzes.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {quizzes.map((quiz) => (
                            <QuizDisplay key={quiz._id} quiz={quiz} />
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No quiz questions are associated with this group</p>
                    </div>
                )} */}
            </section>

            <section>
                <h2>Notes</h2>

                {/* {notes.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {notes.map((note) => (
                            <NoteDisplay key={note._id} note={note} />
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No notes are associated with this group</p>
                    </div>
                )} */}
            </section>

            <section>
                <h2>Sources</h2>

                {/* {sources.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {sources.map((source) => (
                            <SourceDisplay key={source._id} source={source} />
                        ))}
                    </ol>
                ) : (
                    <div className="paragraph">
                        <p>No sources are associated with this group</p>
                    </div>
                )} */}
            </section>
        </main>
    );
}
