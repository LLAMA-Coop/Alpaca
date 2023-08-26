import styles from './NoteDisplay.module.css';
import { capitalize } from "@/lib/strings";
import { Card } from "@components/client";
import Source from "@models/Source";
import User from "@models/User";
import Link from "next/link";

export async function NoteDisplay({ note }) {
    const user = await User.findById(note.createdBy);

    return (
        <Card
            title={`${user?.username ?? "Unknown"}'s Note`}
            description={`Content: ${note.text}`}
        >
            <div>Sources linked:</div>
            <ul>
                {note.sources.map(async (sourceId) => {
                    const source = await Source.findOne({ _id: sourceId });

                    return (
                        <li key={sourceId}>
                            <Link
                                className={styles.sourceLink}
                                href={`/sources/${sourceId}`}
                            >
                                <div>
                                    {source.title}
                                </div>

                                <div>
                                    {capitalize(source.medium)}
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
