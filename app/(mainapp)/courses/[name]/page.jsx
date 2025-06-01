import { getPermittedResources, getRelationships } from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import { CourseDash } from "./CourseDash";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function CoursePage(props) {
  const params = await props.params;
  const user = await useUser({ token: (await cookies()).get("token")?.value });
  const name = decodeURIComponent(params.name);

  const resources = await getPermittedResources({
    userId: user.id,
    takeAll: true,
  });

  const course = resources.courses.find((x) => x.name === name);
  if (!course) return redirect("/courses");

  const relationships = await getRelationships();
  const includeRef = relationships.filter((x) => !!x.includeReference);

  const listName = {
    quiz: "quizzes",
    note: "notes",
    source: "sources",
    course: "courses",
  };

  relationships.forEach((rel) => {
    includeRef.forEach((x) => {
      if (
        x.AType !== "course" &&
        x.AType === rel.AType &&
        rel.BType !== "course" &&
        x.A === rel.A
      ) {
        const newRel = {
          A: x.B,
          AType: "course",
          B: rel.B,
          BType: rel.BType,
        };
        relationships.push(newRel);
      }
      
      if (
        x.AType !== "course" &&
        x.AType === rel.BType &&
        rel.BType !== "course" &&
        x.A === rel.B
      ) {
        const newRel = {
          A: rel.A,
          AType: rel.AType,
          B: x.B,
          BType: "course",
        };
        relationships.push(newRel);
      }

      if (x.BType !== "course" && x.BType === rel.BType && x.B === rel.B) {
        const newRel = {
          AType: rel.BType,
          A: rel.B,
          BType: "course",
          B: x.A,
        };
        relationships.push(newRel);
      }
    });
  });

  relationships.forEach((rel) => {
    if (rel.A === course.id && rel.AType === "course") {
      const listType = listName[rel.BType];
      if (!course[listType]) course[listType] = [];
      course[listType].push(rel.B);
      return;
    }

    if (rel.B === course.id && rel.BType === "course") {
      const listType = listName[rel.AType];
      if (!course[listType]) course[listType] = [];
      course[listType].push(rel.A);
      return;
    }
  });

  return <CourseDash course={course} isLogged={!!user} />;
}
