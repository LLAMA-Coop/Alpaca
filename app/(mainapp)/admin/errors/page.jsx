import styles2 from "@main/page.module.css";
import styles from "./ErrorBug.module.css";
import { redirect } from "next/navigation";
import { DeleteNote } from "./DeleteNote";
import { ErrorNote } from "./ErrorNote";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export default async function ErrorsBugsPage() {
    const user = await useUser({ token: (await cookies()).get("token")?.value, select: ["id", "role"] });
    if (user?.role !== "admin") redirect("/me/dashboard");

    const errors = await db
        .selectFrom("error_logs")
        .selectAll()
        .orderBy("triggered_at", "desc")
        .limit(20)
        .execute();

    const totalErrors =
        (
            await db
                .selectFrom("error_logs")
                .select(({ fn }) => fn.count("id").as("count"))
                .executeTakeFirst()
        )?.count || 0;

    return (
        <main className={styles2.main}>
            <header>
                <h1>Errors and Bugs</h1>

                <p>Total errors: {totalErrors}</p>
            </header>

            <section>
                {errors.length > 0 && (
                    <ul className={styles.errors}>
                        {errors.map((error) => (
                            <li
                                key={error.id}
                                className={styles.error}
                            >
                                <DeleteNote error={error} />

                                <header>
                                    <h2>
                                        {error.name} for{" "}
                                        <span className={styles.colored}>{error.route}</span>
                                        <span className={styles.chip}>{error.id}</span>
                                    </h2>
                                </header>

                                <p>{error.message}</p>

                                <div>
                                    <p>Code</p>
                                    <code className="scrollbar">{error.code}</code>
                                </div>

                                <div>
                                    <p>Stack</p>
                                    <code className="scrollbar">{error.stack}</code>
                                </div>

                                <ErrorNote error={error} />

                                <p className={styles.paragraph}>
                                    Occurred at {error.triggeredAt.toString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
