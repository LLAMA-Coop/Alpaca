import { SourceInput, UserInput, NoteInput } from "@components/client";
import { NoteDisplay, SourceDisplay } from "@components/server";
import styles from "./page.module.css";
import { serialize } from "@/lib/db";
import Source from "@models/Source";
import Note from "@models/Note";

export default async function Home() {
    const sources = serialize(await Source.find());
    const notes = serialize(await Note.find());

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
                </section>
            )}

            <section>
                <h3>Create new source</h3>
                <SourceInput />
            </section>

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
                </section>
            )}

            <section>
                <h3>Create new note</h3>
                <NoteInput availableSources={sources} />
            </section>
        </main>
    );
}
