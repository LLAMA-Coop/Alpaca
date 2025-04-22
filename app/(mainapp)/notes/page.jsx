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

    if (page < 1 || amount < 1 || amount > 100) {
        return redirect(
            `/notes?page=${page < 1 ? 1 : page}&amount=${
                amount < 1 ? 10 : amount > 100 ? 100 : amount
            }`
        );
    }

    const { notes } = await getPermittedResources({
        withNotes: true,
        userId: user?.id,
        limit: amount + 1,
        offset: (page - 1) * amount,
    });

    const hasMore = notes.length > amount;

    if (page > 1 && notes.length === 0) {
        return redirect(`/notes?page=1&amount=${amount}`);
    }

    return (
        <main className={styles.main}>
            <header>
                <h1>Notes</h1>

                <p>
                    A note is a record of your thoughts, ideas, or summaries of a source. You can
                    use notes to create quiz questions or to help you study.{` `}
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
                            {notes.slice(0, amount).map((note) => (
                                <li key={note.id}>
                                    <NoteDisplay note={note} />
                                </li>
                            ))}
                        </MasoneryList>

                        <div className={styles.paginationButtons}>
                            {page < 2 ? (
                                <button
                                    disabled
                                    className="button submit"
                                >
                                    Previous page
                                </button>
                            ) : (
                                <Link
                                    className="button submit"
                                    href={`/notes?page=${page - 1}&amount=${amount}`}
                                >
                                    Previous page
                                </Link>
                            )}

                            {!hasMore ? (
                                <button
                                    disabled
                                    className="button submit"
                                >
                                    Next page
                                </button>
                            ) : (
                                <Link
                                    className="button submit"
                                    href={`/notes?page=${page + 1}&amount=${amount}`}
                                >
                                    Next page
                                </Link>
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
                            Hey, we searched high and low, but we couldn't find any notes.
                            <br />
                            {user ? (
                                "Maybe you should try again later or create your own notes."
                            ) : (
                                <>
                                    You may find more when you{" "}
                                    <Link
                                        className="link"
                                        href="/login?next=/notes"
                                    >
                                        log in{" "}
                                    </Link>
                                    or{" "}
                                    <Link
                                        className="link"
                                        href="/register"
                                    >
                                        register
                                    </Link>
                                    .
                                </>
                            )}
                        </p>

                        <Link
                            className="button primary"
                            href="/create"
                        >
                            Create a note
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
