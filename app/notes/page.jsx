import { NoteDisplay } from "@components/server";
import { NoteInput, InputPopup } from "@components/client";
import styles from "@/app/page.module.css";
import { serialize, serializeOne } from "@/lib/db";
import { useUser, canEdit, queryReadableResources } from "@/lib/auth";
import { Source, Note, User } from "@mneme_app/database-models";
import { redirect } from "next/navigation";

export default async function NotesPage({ searchParams }) {
    const user = serializeOne(await useUser());
    User.populate(user, ["groups", "associates"]);
    const query = queryReadableResources(user);

    const page = Number(searchParams["page"] ?? 1);
    const amount = Number(searchParams["amount"] ?? 10);
    if (page < 1 || amount < 1) {
        return redirect(
            `/notes?page=${page < 1 ? 1 : page}&amount=${
                amount < 1 ? 10 : amount
            }`,
        );
    }

    const notes = serialize(
        await Note.find(query)
            .limit(amount)
            .skip((page - 1) * amount),
    );

    const hasMore =
        (
            await Note.find(query)
                .limit(1)
                .skip((page - 1) * amount + amount)
        )?.length > 0;

    if (page > 1 && notes.length === 0) {
        return redirect(`/notes?page=1&amount=${amount}`);
    }

    const sources = user ? serialize(await Source.find(query)) : [];

    return (
        <main className={styles.main}>
            <h2>Notes</h2>

            {notes.length > 0 && (
                <section>
                    <h3>Available Notes</h3>

                    <ol className={styles.listGrid}>
                        {notes.map((note) => (
                            <li key={note.id}>
                                <NoteDisplay note={note} />
                                {user && canEdit(note, serializeOne(user)) && (
                                    <InputPopup
                                        type="note"
                                        resource={serializeOne(note)}
                                    />
                                )}
                            </li>
                        ))}
                    </ol>

                    <div className={styles.paginationButtons}>
                        {page > 1 ? (
                            <Link
                                className="button submit"
                                href={`/notes?page=${
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
                                href={`/notes?page=${
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
                    <h3>Create new note</h3>
                    <NoteInput availableSources={sources} />
                </section>
            )}
        </main>
    );
}
