import styles from "@main/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export default async function ErrorsBugsPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    const devIDs = process.env.DEVELOPERS?.split(",").map((id) => parseInt(id));

    if (!user || !devIDs?.includes(user.id)) {
        return redirect("/");
    }

    const errors = await db.selectFrom("error_logs").selectAll().execute();

    return (
        <main className={styles.main}>
            <section>
                <h2
                    style={{
                        textAlign: "center",
                        fontSize: "2.5rem",
                        marginBottom: "1rem",
                    }}
                >
                    Errors and Bugs
                </h2>
                {errors.length === 0 && <div>No errors remain in ErrorsBugs table</div>}

                {errors.length > 0 && (
                    <ul>
                        {errors.map((err) => (
                            <li
                                key={err.id}
                                style={{
                                    margin: "2rem",
                                    padding: "0.5rem",
                                    border: "1px solid lightgreen",
                                    borderRadius: "0.5rem",
                                }}
                            >
                                <h3>
                                    {err.name} for {err.function}
                                </h3>
                                <h4>Error #{err.id}</h4>
                                <p style={{ margin: "1rem" }}>{err.message}</p>
                                <code style={{ display: "block", margin: "1rem" }}>{err.code}</code>
                                <code
                                    style={{
                                        display: "block",
                                        margin: "1rem",
                                        wordWrap: "break-word",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {err.stack}
                                </code>
                                <p className={styles.paragraph}>
                                    Occurred at {err.triggeredAt.toString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
