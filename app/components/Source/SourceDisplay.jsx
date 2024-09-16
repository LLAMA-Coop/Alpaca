"use client";

import styles from "./SourceDisplay.module.css";
import { Card } from "@client";

export function SourceDisplay({ source }) {
    if (!source) return;

    // const user = await useUser({ token: cookies().get("token")?.value });
    // const addedBy = await useUser({ id: source.createdBy });

    // const courses = (
    //     await getPermittedResources({
    //         userId: user?.id ?? null,
    //         withCourses: true,
    //     })
    // ).filter((x) => source.courses.includes(x.id));

    return (
        <Card
            // title={`${source.title} by ${addedBy?.username || "Unknown"}`}
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

                {source.credits.length > 0 ? (
                    <ol className="chipList">
                        {source.credits.map((cred) => (
                            <li>{cred}</li>
                            // <ListItem
                            //     key={cred}
                            //     item={
                            //         /^http/.test(cred)
                            //             ? "See all of the authors"
                            //             : cred
                            //     }
                            //     link={/^http/.test(cred) ? cred : null}
                            // />
                        ))}
                    </ol>
                ) : (
                    <p>No authors listed</p>
                )}
            </div>

            {source.tags.length > 0 && (
                <div className={styles.tags}>
                    <h5>Tags</h5>

                    <ol className="chipList">
                        {/* {source.tags.map((tag) => (
                            <ListItem key={tag} item={tag} />
                        ))} */}
                    </ol>
                </div>
            )}

            {/* {courses.length > 0 && (
                <div className={styles.tags}>
                    <h5>This note belongs to the following courses</h5>

                    <ul>
                        {courses.map((course) => (
                            <ListItem key={course.id} item={course.name} />
                        ))}
                    </ul>
                </div>
            )} */}
        </Card>
    );
}
