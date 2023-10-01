import styles from "./NoteDisplay.module.css";
import { capitalize } from "@/lib/strings";
import { Card, ListItem } from "@components/client";
// import { Source, User } from "@mneme_app/database-models";
import { Source, User } from "@/app/api/models";
import Link from "next/link";

export async function NoteDisplay({ note }) {
    const user = await User.findById(note.createdBy);

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
                {note.sources.map(async (sourceId) => {
                    const source = await Source.findOne({ _id: sourceId });

                    return (
                        <li key={sourceId}>
                            <Link
                                className={styles.sourceLink}
                                href={source.url}
                            >
                                <div>{source.title}</div>

                                <div>{capitalize(source.medium)}</div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <p>Created by: {user?.username ?? "Unknown"}</p>
        </Card>
    );
}
