import styles from "./NoteDisplay.module.css";
import { Card, ListItem } from "@client";
import { useStore } from "@/store/store";

export function NoteDispClient({ note }) {
    const usersStore = useStore((state) => state.users);
    const sourcesStore = useStore((state) => state.sources);
    const coursesStore = useStore((state) => state.courses);
    
    const creator = usersStore.find((x) => x.id === note.createdBy);
    const sources = sourcesStore.filter((x) => {
        note.sources.find((y) => x == y || y.id == x.id) != undefined;
    });
    const courses = coursesStore.filter((x) => note.courses.includes(x.id));

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
                        {sources.map((source) => {
                            return (
                                <>
                                    <ListItem
                                        key={source.id}
                                        item={source.title}
                                        link={source.url}
                                    />
                                </>
                            );
                        })}
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

            <p>Created by: {creator ? creator.username : "Unknown"}</p>
        </Card>
    );
}
