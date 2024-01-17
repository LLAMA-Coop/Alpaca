import { redirect } from "next/navigation";
import { Course } from "@/app/api/models";
import { cookies } from "next/headers";
import { canRead, useUser } from "@/lib/auth";
import { CourseDash } from "./CourseDash";
import { serializeOne } from "@/lib/db";

export default async function CoursePage({ params }) {
    const { id } = params;

    const course = await Course.findById(id)
        .populate("prerequisites.course")
        .populate("parentCourses");
    if (!course) return redirect("/groups");

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!canRead(course, user)) {
        return redirect("/courses");
    }

    return <CourseDash course={serializeOne(course)} />
}
