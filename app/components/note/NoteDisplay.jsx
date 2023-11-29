import styles from "./NoteDisplay.module.css";
import { Card, ListItem } from "@components/client";
// import { Source, User } from "@mneme_app/database-models";
import { Note, User } from "@/app/api/models";

export async function NoteDisplay({ note }) {
    const user = await User.findById(note.createdBy);
    const dbNote = await Note.findById(note._id).populate("sources").populate("courses");

    return (
        <Card title={note.title} description={`${note.text}`}>
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

            <div className={styles.sources}>
                <h5>Sources linked</h5>
                <ul>
                    {dbNote.sources.map((source) => {
                        return (
                            <ListItem
                                key={source._id}
                                item={source.title}
                                link={source.url}
                            />
                        );
                    })}
                </ul>
            </div>

            <div className={styles.tags}>
                <h5>This note belongs to the following courses</h5>
                {dbNote.courses && dbNote.courses.length > 0 ? (
                    <ul>
                        {dbNote.courses.map((course) => {
                            return (
                                <ListItem key={course._id} item={course.name} />
                            );
                        })}
                    </ul>
                ) : (
                    <p>No Courses Listed</p>
                )}
            </div>

            <p>Created by: {user?.username ?? "Unknown"}</p>
        </Card>
    );
}
