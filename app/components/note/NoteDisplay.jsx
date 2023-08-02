import { SourceDisplay } from "@/app/components/server";
import styles from "./NoteDisplay.module.css";
import Source from "@/app/api/models/Source";
import User from "@/app/api/models/User";

export async function NoteDisplay({ note }) {
  const user = await User.findById(note.addedBy);

  return (
    <div className={styles.note}>
      <h4>{note.text}</h4>
      <p>Added By: {user?.username ?? "Not provided"}</p>

      <ul>
        {note.sources.map(async (srcId) => {
          const src = await Source.findOne({ _id: srcId });

          return (
            <li key={srcId}>
              <SourceDisplay source={src} />
            </li>
          );
        })}
      </ul>

      <p>{note.dateAdded.toDateString()}</p>
    </div>
  );
}
