import styles from "./page.module.css";
import Source from "./api/models/Source";
import SourceDisplay from "./components/source/sourceDisplay";
import SourceInput from "./components/source/sourceInput";
import UserInput from "./components/user/userInput";
import NoteInput from "./components/note/noteInput";
import Note from "./api/models/Note";
import NoteDisplay from "./components/note/noteDisplay";

const sources = await Source.find();
const notes = await Note.find();

export default function Home() {
  return (
    <main className={styles.main}>
      <h2>Let's take it for a spin!</h2>

      <section className="centeredContainer">
        <h3>Sources</h3>

        <div className={styles.sourceGrid}>
          {sources.map((src) => (
            <SourceDisplay key={src._id} source={src} />
          ))}
        </div>
      </section>

      <section>
        <SourceInput />
      </section>

      <section className="centeredContainer">
        <h3>Notes</h3>
        <div className={styles.sourceGrid}>
          {notes.map((note) => (
            <NoteDisplay key={note._id} note={note}></NoteDisplay>
          ))}
        </div>
      </section>

      <section>
        <NoteInput availableSources={JSON.parse(JSON.stringify(sources))} />
      </section>

      <section>
        <UserInput isRegistering={true} />
      </section>
    </main>
  );
}
