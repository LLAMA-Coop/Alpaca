import { useUser } from "@/lib/auth";
import styles from "./NoteDisplay.module.css";
import { Card, ListItem } from "@client";
import { cookies } from "next/headers";
import {
    getPermittedCourses,
    getPermittedNote,
    getPermittedSources,
} from "@/lib/db/helpers";

export async function NoteDisplay({ note }) {
    const creator = await useUser({ id: note.createdBy });
    const user = await useUser({ token: cookies().get("token")?.value });
    const sources = (
        await getPermittedSources(user ? user.id : undefined)
    ).filter((x) => note.sources.includes(x.id));
    const courses = (await getPermittedCourses(user ? user.id : undefined)).filter((x) =>
        note.courses.includes(x.id),
    );

    return (
        <Card title={note.title} description={note.text}>
            {note.tags?.length > 0 && (
                <section className={styles.section}>
                    <h5>Tags</h5>

                    <ol className="chipList">
                        {note.tags?.map((cont) => (
                            <ListItem key={cont} item={cont} />
                        ))}
                    </ol>
                </section>
            )}

            {sources.length > 0 && (
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
            )}

            <p>Created by: {creator?.username ?? "Unknown"}</p>
        </Card>
    );
}
