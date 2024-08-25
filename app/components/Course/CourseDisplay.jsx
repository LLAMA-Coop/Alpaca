import { Card, ListItem } from "../client";
import styles from "../Note/NoteDisplay.module.css";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function CourseDisplay({ course, canRead }) {
    const user = await useUser({ token: cookies().get("token")?.value });
    const dbCourse = course;

    return (
        <Card
            title={`${dbCourse.name}`}
            description={`${dbCourse.description}`}
            buttons={
                canRead
                    ? [
                          {
                              label: "View Course",
                              link: `/courses/${dbCourse.name}`,
                              sameTab: true,
                          },
                      ]
                    : []
            }
        >
            <div className={styles.tags}>
                <h5>Parent Courses</h5>

                {dbCourse.parentCourses.length > 0 ? (
                    <ol className="chipList">
                        {dbCourse.parentCourses.map((crs) => (
                            <ListItem key={crs.id} item={crs.name} />
                        ))}
                    </ol>
                ) : (
                    <p>No Parent Courses Listed</p>
                )}
            </div>

            <div className={styles.tags}>
                <h5>Prerequisites</h5>

                {dbCourse.prerequisites.length > 0 ? (
                    <ol className="chipList">
                        {dbCourse.prerequisites.map((p) => {
                            const course = p.course;
                            if (!course) {
                                return <li key={p.course}>Unavailable</li>;
                            }

                            const display = `${course.name} - Average Level Required ${p.averageLevelRequired}`;

                            return <ListItem key={course.id} item={display} />;
                        })}
                    </ol>
                ) : (
                    <p>No Prerequisites Listed</p>
                )}
            </div>

            <p>Created by: {user.username}</p>
        </Card>
    );
}
