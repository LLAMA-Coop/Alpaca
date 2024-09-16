import { getPermittedResources } from "@/lib/db/helpers";
import { SourceDisplay } from "@/app/components/server";
import { notFound } from "next/navigation";
import styles from "@main/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function Resource({ params }) {
    const allowedResources = ["sources", "notes", "quizzes", "courses"];

    if (!allowedResources.includes(params.name)) {
        notFound();
    }

    const user = await useUser({ token: cookies().get("token")?.value });

    const resources = await getPermittedResources({
        userId: user?.id ?? null,
        withSources: params.name === "sources",
        withNotes: params.name === "notes",
        withQuizzes: params.name === "quizzes",
        withCourses: params.name === "courses",
    }).then((res) => res[params.name]);

    return (
        <main className={styles.main}>
            <header className={styles.titleBlock}>
                <h1>Hey there! This is the {params.name} page.</h1>

                <p>
                    This is a page where you can view your {params.name}. You
                    can also create new {params.name} here.
                </p>
            </header>

            <section>
                <h2>Your {params.name}</h2>

                <ul>
                    {resources.map((resource) => (
                        <li key={resource.id}>
                            <SourceDisplay source={resource} />
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
