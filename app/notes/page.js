import Note from "../api/models/Note";
import NoteDisplay from "../components/note/noteDisplay";
import NoteInput from "../components/note/noteInput";
import Source from "../api/models/Source";
import styles from "../page.module.css";

const notes = await Note.find();
const sources = await Source.find();

export default function NotePage() {
  return (
    <main className={styles.main}>
      <h2>Notes</h2>

      {notes.length > 0 && (
        <section>
          <div className="centeredContainer">
            <h3>Notes</h3>

            <div className={styles.sourceGrid}>
              {notes.map((note) => <NoteDisplay key={note._id} note={note} />)}
            </div>
          </div>
        </section>
      )}

      <section>
        <NoteInput
          availableSources={JSON.parse(JSON.stringify(sources))}
        />
      </section>
    </main>
  );
}
