import {
  getCourse,
  getPermittedResources,
  getRelationships,
} from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import { CourseDash } from "./CourseDash";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function CoursePage(props) {
  const params = await props.params;
  const user = await useUser({ token: (await cookies()).get("token")?.value });
  const name = decodeURIComponent(params.name);

  // const course = await getCourse({ name });
  const resources = await getPermittedResources({
    userId: user.id,
    takeAll: true,
  });

  console.log("RESOURCES", resources);

  const course = resources.courses.find((x) => x.name === name);

  const relationships = await getRelationships({
    type: "course",
    id: course.id,
  });
  console.log(course);

  if (!course) return redirect("/courses");

  return <CourseDash course={course} isLogged={!!user} />;
}
