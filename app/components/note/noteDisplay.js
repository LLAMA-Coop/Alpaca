import User from "@/app/api/models/User";
import SourceDisplay from "../source/sourceDisplay";
import Source from "@/app/api/models/Source";
import styles from "./noteDisplay.module.css";

export default async function NoteDisplay({ note }) {
  const user = await User.findById(note.addedBy);

  return (
    <div className={styles.note}>
      <p>{note.text}</p>
      <p>Added By: {user?.username ?? 'Not provided'}</p>

      <ul>
        {note.sources.map(async (srcId) => {
          const src = await Source.findOne({ _id: srcId });

          return (
            <li key={srcId}>
              <SourceDisplay source={src}></SourceDisplay>
            </li>
          );
        })}
      </ul>

      <p>{note.dateAdded.toDateString()}</p>
    </div>
  );
}
