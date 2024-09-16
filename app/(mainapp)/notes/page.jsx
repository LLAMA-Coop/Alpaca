import { getPermittedResources } from "@/lib/db/helpers";
import styles from "@main/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NoteDisplay } from "@server";
import { InputPopup } from "@client";
import { useUser } from "@/lib/auth";
import Link from "next/link";

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

    const { notes } = await getPermittedResources({
        withNotes: true,
        userId: user?.id,
    });

    const hasMore = false;

    if (page > 1 && notes.length === 0) {
        return redirect(`/notes?page=1&amount=${amount}`);
    }

    return (
        <main className={styles.main}>
            <header>
                <h1>Notes</h1>

                <p>
                    A note is a response to or summary of information in a cited
                    source or multiple sources.
                    <br />
                    {user
                        ? `These are the notes that are publicly viewable, as well as the ones you made.`
                        : `You are only viewing the publicly available notes.
                           Log in to see notes available to you and create your own notes.`}
                </p>
            </header>

            <section>
                <h2>Available Notes</h2>

                <ol className={styles.listGrid}>
                    {notes.map((note) => {
                        const isCreator = user && note.creator.id === user.id;
                        const canWrite = isCreator || note.allCanWrite;

                        return (
                            <li key={note.id}>
                                <NoteDisplay note={note} />

                                {canWrite && (
                                    <InputPopup type="note" resource={note} />
                                )}

                                <Link href={`/notes/${note.id}`}>
                                    Go to Note Page
                                </Link>
                            </li>
                        );
                    })}

                    {notes.length === 0 && (
                        <p className={styles.noContent}>
                            Oh, that's awkward. There are no notes to display.
                            <br />
                            <Link className="link" href="/register">
                                Register
                            </Link>{" "}
                            and create your own notes, you'll love it!
                        </p>
                    )}
                </ol>

                {notes.length > 0 && (
                    <div className={styles.paginationButtons}>
                        {page > 1 ? (
                            <Link
                                className="button submit"
                                href={`/notes?page=${page - 1}&amount=${amount}`}
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
                                href={`/notes?page=${page + 1}&amount=${amount}`}
                            >
                                Next page
                            </Link>
                        ) : (
                            <button disabled className="button submit">
                                Next page
                            </button>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
