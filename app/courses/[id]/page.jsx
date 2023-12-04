import { Course } from "@/app/api/models";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { canRead } from "@/lib/auth";
import { CourseDisplay } from "@/app/components/Course0/CourseDisplay";
import { useUser } from "@/lib/auth";

export default async function CoursePage({ params }) {
    const id = params.id;
    const course = await Course.findById(id)
        .populate("prerequisites.course")
        .populate("parentCourses");
    if (!course) return redirect("/groups");

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!canRead(course, user)) {
        return redirect("/groups");
    }

    return (
        <main>
            <h2>{course.name}</h2>
            <section>
                <h3>Prerequisites</h3>
                <ul>
                    {course.prerequisites.map((p) => {
                        return (
                            <li key={p.course._id}>
                                <p>{p.requiredAverageLevel}</p>
                                <CourseDisplay course={p.course} />
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section>
                <h3>Parent Courses</h3>
                <ul>
                    {course.parentCourses.map((c) => {
                        return (
                            <li key={c._id}>
                                <CourseDisplay course={c} />
                            </li>
                        );
                    })}
                </ul>
            </section>
        </main>
    );
}
