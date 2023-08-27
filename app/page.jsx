import { NoteDisplay, SourceDisplay } from "@components/server";
import { SourceInput, NoteInput } from "@components/client";
import { serializeOne } from "@/lib/db";
import styles from "./page.module.css";
import { useUser } from "@/lib/auth";
import { serialize } from "@/lib/db";
import Source from "@models/Source";
import Note from "@models/Note";
import Link from "next/link";

export default async function Home({ searchParams }) {
    const user = serializeOne(await useUser());

    const page = Number(searchParams["page"] ?? "1");
    const amount = Number(searchParams["amount"] ?? "10");

    if (page < 1) {
        return redirect("/?page=1&amount=" + amount);
    }

    if (amount < 1) {
        return redirect("/?page=" + page + "&amount=10");
    }

    const sources = serialize(
        await Source.find()
            .limit(amount)
            .skip((page - 1) * amount),
    );

    const notes = serialize(
        await Note.find()
            .limit(amount)
            .skip((page - 1) * amount),
    );

    const hasMoreSources =
        (
            await Source.find()
                .limit(1)
                .skip((page - 1) * amount + amount)
        )?.length > 0;

    const hasMoreNotes =
        (
            await Note.find()
                .limit(1)
                .skip((page - 1) * amount + amount)
        )?.length > 0;

    if (page > 1 && sources.length === 0) {
        redirect("/sources?page=1&amount=" + amount);
    }

    return (
        <main className={styles.main}>
            <h2>Let's take it for a spin!</h2>

            {sources.length > 0 && (
                <section>
                    <h3>Your sources</h3>

                    <ol className={styles.listGrid}>
                        {sources.map((src) => (
                            <li key={src.id}>
                                <SourceDisplay source={src} />
                            </li>
                        ))}
                    </ol>

                    <div className={styles.paginationButtons}>
                        {page > 1 ? (
                            <Link
                                className="button submit"
                                href={`/?page=${page - 1}&amount=${amount}`}
                            >
                                Previous page
                            </Link>
                        ) : (
                            <button disabled className="button submit">
                                Previous page
                            </button>
                        )}

                        {hasMoreSources ? (
                            <Link
                                className="button submit"
                                href={`/?page=${page + 1}&amount=${amount}`}
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
                    <h3>Create new source</h3>
                    <SourceInput />
                </section>
            )}

            {notes.length > 0 && (
                <section>
                    <h3>Your notes</h3>

                    <ol className={styles.listGrid}>
                        {notes.map((note) => (
                            <li key={note.id}>
                                <NoteDisplay note={note} />
                            </li>
                        ))}
                    </ol>

                    <div className={styles.paginationButtons}>
                        {page > 1 ? (
                            <Link
                                className="button submit"
                                href={`/?page=${page - 1}&amount=${amount}`}
                            >
                                Previous page
                            </Link>
                        ) : (
                            <button disabled className="button submit">
                                Previous page
                            </button>
                        )}

                        {hasMoreNotes ? (
                            <Link
                                className="button submit"
                                href={`/?page=${page + 1}&amount=${amount}`}
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
