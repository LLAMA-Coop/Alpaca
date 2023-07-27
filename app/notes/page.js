import Note from "../api/models/Note";
import NoteDisplay from "../components/note/noteDisplay";
import NoteInput from "../components/note/noteInput";
import Source from "../api/models/Source";

const notes = await Note.find();
const sources = await Source.find();

export default function NotePage() {
  return (
    <main>
      <h2>Notes</h2>
      <ul>
        {notes.map((note) => {
          return (
            <li key={note._id}>
              <NoteDisplay note={note}></NoteDisplay>
            </li>
          );
        })}
      </ul>

      <NoteInput availableSources={sources.map((src) => {
        let { title, url, _id } = src;
        return { title, url, _id: _id.toString() };
      })} />
    </main>
  );
}
