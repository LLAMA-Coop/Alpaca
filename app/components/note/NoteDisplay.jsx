import styles from "./NoteDisplay.module.css";
import { Card, ListItem } from "@client";
import { Note, User } from "@models";

export async function NoteDisplay({ note }) {
    const user = await User.findById(note.createdBy);
    const dbNote = await Note.findById(note._id).populate("sources");

    return (
        <Card description={`${note.text}`}>
            <div className={styles.tags}>
                <h5>Tags</h5>
                {note.tags?.length > 0 ? (
                    <ol className="chipList">
                        {note.tags?.map((cont) => (
                            <ListItem key={cont} item={cont} />
                        ))}
                    </ol>
                ) : (
                    <p>No tags for note</p>
                )}
            </div>

            <div>Sources linked:</div>
            <ul>
                {dbNote.sources.map((source) => {
                    return (
                        <li key={source._id}>
                            <a className={styles.sourceLink} href={source.url}>
                                <div>{source.title}</div>

                                <div>{source.medium}</div>
                            </a>
                        </li>
                    );
                })}
            </ul>
            <p>Created by: {user?.username ?? "Unknown"}</p>
        </Card>
    );
}
