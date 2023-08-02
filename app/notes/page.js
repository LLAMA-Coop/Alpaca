import { NoteDisplay } from "@/app/components/server";
import { NoteInput } from "@/app/components/client";
import Source from "@/app/api/models/Source";
import styles from "@/app/Page.module.css";
import Note from "@/app/api/models/Note";

const notes = await Note.find();
const sources = await Source.find();

export default function NotePage() {
  return (
    <main className={styles.main}>
      <h2>Notes</h2>

      {notes.length > 0 && (
        <section>
          <h3>Your notes</h3>

          <ol className={styles.listGrid}>
            {notes.map((note) => (
              <NoteDisplay key={note._id} note={note} />
            ))}
          </ol>
        </section>
      )}

      <section>
        <h3>Create new note</h3>

        <NoteInput availableSources={JSON.parse(JSON.stringify(sources))} />
      </section>
    </main>
  );
}
