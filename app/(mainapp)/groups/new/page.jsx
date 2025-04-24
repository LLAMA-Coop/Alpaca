import styles from "@/app/(mainapp)/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { GroupInput } from "@client";

export default async function NewGroupPage() {
    const user = await useUser({ token: (await cookies()).get("token")?.value });
    if (!user) return redirect("/groups");

    return (
        <main className={styles.main}>
            <header>
                <h1>Create a new group</h1>

                <p>
                    A group is a collection of users who can share resources,
                    notes and quizzes with each other.
                </p>
            </header>

            <section>
                <GroupInput />
            </section>
        </main>
    );
}
