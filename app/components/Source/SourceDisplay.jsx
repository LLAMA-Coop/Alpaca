import styles from "./SourceDisplay.module.css";
import { ListItem, Card } from "@client";
import { Source, User } from "@models";

export async function SourceDisplay({ source }) {
    if (!source) return;
    // const user = await User.findById(source.createdBy);
    const user = {};
    // const dbSource = await Source.findById(source.id).populate("courses");
    const dbSource = {};

    return (
        <Card
            title={source.title}
            subtitle={source.medium}
            buttons={[
                {
                    label: "Visit the source page",
                    link: source.url,
                },
            ]}
        >
            <div className={styles.authors}>
                <h5>Authors</h5>
                {source.authors?.length > 0 ? (
                    <ol className="chipList">
                        {source.authors?.map((cont) => (
                            <ListItem
                                key={cont}
                                item={
                                    /^http/.test(cont)
                                        ? "See all of the authors"
                                        : cont
                                }
                                link={/^http/.test(cont) ? cont : null}
                            />
                        ))}
                    </ol>
                ) : (
                    <p>No authors listed</p>
                )}
            </div>

            <div className={styles.tags}>
                <h5>Tags</h5>
                {source.tags?.length > 0 ? (
                    <ol className="chipList">
                        {source.tags?.map((cont) => (
                            <ListItem key={cont} item={cont} />
                        ))}
                    </ol>
                ) : (
                    <p>No tags for source</p>
                )}
            </div>

            <div className={styles.tags}>
                <h5>This note belongs to the following courses</h5>
                {dbSource.courses && dbSource.courses.length > 0 ? (
                    <ul>
                        {dbSource.courses.map((course) => {
                            return (
                                <ListItem key={course.id} item={course.name} />
                            );
                        })}
                    </ul>
                ) : (
                    <p>No Courses Listed</p>
                )}
            </div>

            <p>Added by: {user?.username ?? "Unknown"}</p>
        </Card>
    );
}
