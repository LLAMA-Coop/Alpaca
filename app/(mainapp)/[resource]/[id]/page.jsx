import { getPermittedResources } from "@/lib/db/helpers";
import styles from "@/app/(mainapp)/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import {
    CardDescription,
    CourseDisplay,
    NoteDisplay,
    QuizDisplay,
    SourceDisplay,
} from "@/app/components/client";

const resourceList = ["sources", "notes", "quizzes", "courses"];

const names = {
    sources: "Source",
    notes: "Note",
    quizzes: "Quiz",
    courses: "Course",
};

export default async function SourcePage(props) {
    const params = await props.params;
    const { resource, id } = params;

    if (!resourceList.includes(resource)) redirect("/");

    const user = await useUser({ token: (await cookies()).get("token")?.value });
    if (!user) return redirect(`/login?next=/${resource}/${id}`);

    const resourcesObject = await getPermittedResources({
        withSources: resource === "sources",
        withNotes: resource === "notes",
        withQuizzes: resource === "quizzes",
        withCourses: resource === "courses",
        publicIds: [id],
        userId: user.id,
        limit: 1,
    });

    const resources = resourcesObject[resource];
    if (!resources || resources.length === 0) return redirect(`/${resource}`);

    const res = resources[0];
    if (!res) return redirect(`/${resource}`);

    return (
        <main className={styles.main}>
            <section className={styles.section}>
                <header>
                    <h2>
                        {names[resource]} {res.title}
                    </h2>
                </header>

                {resource === "sources" && <SourceDisplay source={res} />}
                {resource === "notes" && <NoteDisplay note={res} />}
                {resource === "quizzes" && <QuizDisplay quiz={res} />}
                {resource === "courses" && <CourseDisplay course={res} />}
            </section>

            {resource === "notes" && (
                <section>
                    <h2>Full Content</h2>

                    <div
                        style={{
                            padding: "16px",
                            borderRadius: "5px",
                            backgroundColor: "var(--bg-0)",
                        }}
                    >
                        <CardDescription setInnerHtml={true}>{res.text}</CardDescription>
                    </div>
                </section>
            )}
        </main>
    );
}
