import { useUser } from "@/lib/auth";
import { NoteInput, InputPopup } from "@client";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NoteDisplay } from "@server";
import Link from "next/link";
import { getPermittedNotes } from "@/lib/db/helpers";

export default async function NotesPage({ searchParams }) {
    const user = await useUser({ token: cookies().get("token")?.value });

    const page = Number(searchParams["page"] ?? 1);
    const amount = Number(searchParams["amount"] ?? 10);
    if (page < 1 || amount < 1) {
        return redirect(
            `/notes?page=${page < 1 ? 1 : page}&amount=${
                amount < 1 ? 10 : amount
            }`,
        );
    }

    const notes = user
        ? await getPermittedNotes(user.id)
        : await getPermittedNotes();

    const hasMore = false;

    if (page > 1 && notes.length === 0) {
        return redirect(`/notes?page=1&amount=${amount}`);
    }

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>Notes</h2>

                <p>
                    A note is a response to or summary of information in a cited
                    source or multiple sources.
                    <br />
                    {user
                        ? `These are the notes that are publicly viewable, as well as the ones you made.`
                        : `You are only viewing the publicly available notes.
                           Log in to see notes available to you and create your own notes.`}
                </p>
            </div>

            {notes.length > 0 && (
                <section>
                    <h3>Available Notes</h3>

                    <ol className={styles.listGrid}>
                        {notes.map((note) => {
                            const isCreator =
                                user &&
                                ((note.createdBy &&
                                    note.createdBy === user.id) ||
                                    (note.creator &&
                                        note.creator.id === user.id));
                            const canEdit =
                                isCreator || note.permissionType === "write";

                            return (
                                <li key={note.id}>
                                    <NoteDisplay note={note} />

                                    {canEdit && (
                                            <InputPopup
                                                type="note"
                                                resource={note}
                                            />
                                        )}

                                    <Link href={`/notes/${note.id}`}>
                                        Go to Note Page
                                    </Link>
                                </li>
                            );
                        })}
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
                    <NoteInput />
                </section>
            )}
        </main>
    );
}
