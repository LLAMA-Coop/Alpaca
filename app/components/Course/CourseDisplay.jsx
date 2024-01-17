import Course from "@/app/api/models/Course";
import { User } from "@/app/api/models";
import { Card, ListItem } from "../client";
import styles from "../Note/NoteDisplay.module.css";

export async function CourseDisplay({ course }) {
    const user = await User.findById(course.createdBy);
    const dbCourse = await Course.findById(course._id)
        .populate("parentCourses")
        .populate("prerequisites.course");

    return (
        <Card
            title={`${dbCourse.name}`}
            description={`${dbCourse.description}`}
        >
            <div className={styles.tags}>
                <h5>Parent Courses of this Course</h5>
                {dbCourse.parentCourses.length > 0 ? (
                    <ol className="chipList">
                        {dbCourse.parentCourses.map((cat) => {
                            return <ListItem key={cat._id} item={cat.name} />;
                        })}
                    </ol>
                ) : (
                    <p>No Parent Courses Listed</p>
                )}
            </div>

            <div className={styles.tags}>
                <h5>Prerequisites for this Course</h5>
                {dbCourse.prerequisites.length > 0 ? (
                    <ol className="chipList">
                        {dbCourse.prerequisites.map((p) => {
                            const course = p.course;
                            if (!course) {
                                return <li key={p.course}>Unavailable</li>;
                            }

                            const display = `${course.name} - Average Level Required ${p.averageLevelRequired}`


                            return (
                                <ListItem key={course._id} item={display} />
                            );
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
