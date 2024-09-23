"use client";

import styles from "./NoteDisplay.module.css";
import { Card } from "@client";

export function NoteDisplay({ note }) {
    return (
        <Card title={note.title} description={note.text}>
            {note.tags?.length > 0 && (
                <section className={styles.section}>
                    <h5>Tags</h5>

                    <ol className="chipList">
                        {note.tags?.map((cont) => (
                            <li key={cont.id}>{cont.name}</li>
                        ))}
                    </ol>
                </section>
            )}

            {/* {sources?.length > 0 && (
                <section className={styles.section}>
                    <h5>Sources linked</h5>

                    <ul>
                        {sources.map((source) => (
                            <ListItem
                                key={source.id}
                                item={source.title}
                                link={source.url}
                            />
                        ))}
                    </ul>
                </section>
            )}

            {courses?.length > 0 && (
                <section className={styles.section}>
                    <h5>This note belongs to the following courses</h5>

                    <ul>
                        {courses.map((course) => (
                            <ListItem key={course.id} item={course.name} />
                        ))}
                    </ul>
                </section>
            )} */}

            <p>Created by: {note.creator?.username ?? "Unknown"}</p>
        </Card>
    );
}
