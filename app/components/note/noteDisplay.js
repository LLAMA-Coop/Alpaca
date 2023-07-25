import User from "@/app/api/models/User";
import SourceDisplay from "../source/sourceDisplay";
import Source from "@/app/api/models/Source";
import styles from "./noteDisplay.module.css"

export default async function NoteDisplay({ note }) {
  const user = await User.findById(note.addedBy);

  return (
    <div className={styles.note}>
      <p>{note.text}</p>
      <p>Added By: {user.username}</p>
      <ul>
        {note.sources.map(async (srcId) => {
          return (
            <li key={srcId}>
              <SourceDisplay
                source={await Source.findById(srcId)}
              ></SourceDisplay>
            </li>
          );
        })}
      </ul>

      <p>
        {note.dateAdded.toDateString()}
      </p>
    </div>
  );
}
