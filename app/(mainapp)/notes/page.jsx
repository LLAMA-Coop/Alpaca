import { getPermittedResources } from "@/lib/db/helpers";
import { MasoneryList, NoteDisplay } from "@client";
import styles from "@main/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Image from "next/image";
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
                    A note is a record of your thoughts, ideas, or summaries of
                    a source. You can use notes to create quiz questions or to
                    help you study.{` `}
                    {user
                        ? `These are the notes that are publicly viewable, as well as the ones you made.`
                        : `You are only viewing the publicly available notes.
                           Log in to see notes available to you.`}
                </p>
            </header>

            <section>
                {notes.length > 0 ? (
                    <>
                        <h2>Available Notes</h2>

                        <MasoneryList>
                            {notes.map((note) => (
                                <li key={note.id}>
                                    <NoteDisplay note={note} />
                                </li>
                            ))}
                        </MasoneryList>

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
                    </>
                ) : (
                    <div className={styles.noResults}>
                        <Image
                            src="/assets/no-results.svg"
                            alt="No notes"
                            height={400}
                            width={400}
                        />

                        <p>
                            Hey, we searched high and low, but we couldn't find
                            any notes.
                            <br />
                            Maybe you should try again later or create your own
                            notes.
                        </p>

                        <Link className="button primary" href="/create">
                            Create a note
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
