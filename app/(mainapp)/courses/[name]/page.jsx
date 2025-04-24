import { getCourse } from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import { CourseDash } from "./CourseDash";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function CoursePage(props) {
    const params = await props.params;
    const user = await useUser({ token: (await cookies()).get("token")?.value });
    const name = decodeURIComponent(params.name);

    const course = await getCourse({ name });
    if (!course) return redirect("/courses");

    return (
        <CourseDash
            course={course}
            isLogged={!!user}
        />
    );
}
