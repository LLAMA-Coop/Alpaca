import Source from './api/models/Source';
import styles from './Page.module.css';
import Note from './api/models/Note';
import { SourceInput, UserInput, NoteInput } from '@/app/components/client';
import { NoteDisplay, SourceDisplay } from '@/app/components/server';

const sources = await Source.find();
const notes = await Note.find();

export default function Home() {
    return (
        <main className={styles.main}>
            <h2>Let's take it for a spin!</h2>

            {sources.length > 0 && (
                <section>
                    <h3>Your sources</h3>

                    <ol className={styles.listGrid}>
                        {sources.map((src) => (
                            <li key={src._id}>
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
                            <NoteDisplay
                                key={note._id}
                                note={note}
                            ></NoteDisplay>
                        ))}
                    </ol>
                </section>
            )}

            <section>
                <h3>Create new note</h3>
                <NoteInput availableSources={JSON.parse(JSON.stringify(sources))} />
            </section>

            <section>
                <h3>Register new user</h3>
                <UserInput isRegistering={true} />
            </section>
        </main>
    );
}
