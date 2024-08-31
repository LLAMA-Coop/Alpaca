import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { CourseDash } from "./CourseDash";
import { getPermittedCourses } from "@/lib/db/helpers";

export default async function CoursePage({ params }) {
    const user = await useUser({ token: cookies().get("token")?.value });

    const { name } = params;
    const nameDecoded = decodeURIComponent(name);

    const course = (await getPermittedCourses(user ? user.id : undefined)).find(
        (x) => x.name === nameDecoded,
    );

    if (!course) return redirect("/courses");

    return <CourseDash course={course} isLogged={user ? true : false} />;
}
