import styles2 from "@/app/(mainapp)/page.module.css";
import { jsonObject } from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import styles from "./Reports.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { Avatar } from "@/app/components/client";

export default async function ReportsPage() {
    const user = await useUser({
        token: (await cookies()).get("token")?.value || "",
        select: ["id", "role"],
    });

    if (user?.role !== "admin") redirect("/me/dashboard");

    const reports = await db
        .selectFrom("user_reports as ur")
        .selectAll()
        .select(({ selectFrom }) => [
            selectFrom("users as u")
                .select(
                    jsonObject({
                        list: ["id", "username", "role", "email", "avatar", "createdAt"],
                        table: "u",
                    })
                )
                .whereRef("u.id", "=", "ur.reporter")
                .as("reporter"),
            selectFrom("users as u")
                .select(
                    jsonObject({
                        list: ["id", "username", "role", "email", "avatar", "createdAt"],
                        table: "u",
                    })
                )
                .whereRef("u.id", "=", "ur.reported")
                .as("reported"),
        ])
        .orderBy("ur.createdAt", "desc")
        .limit(50)
        .execute();

    reports.map((report) => {
        report.reporter = JSON.parse(report.reporter);
        report.reported = JSON.parse(report.reported);
        return report;
    });

    const totalReports =
        (
            await db
                .selectFrom("user_reports")
                .select(({ fn }) => fn.count("id").as("count"))
                .executeTakeFirst()
        )?.count || 0;

    return (
        <main className={styles2.main}>
            <header>
                <h1>User Reports</h1>
                <p>Total reports made: {totalReports}</p>
            </header>

            <section>
                <ul className={styles.reports}>
                    {reports.map((report) => (
                        <li
                            key={report.id}
                            className={styles.report}
                        >
                            <header>
                                <User user={report.reporter} />
                                <h2>Reported</h2>
                                <User user={report.reported} />
                            </header>

                            <div>
                                <span>Reported for</span>
                                <p>{report.type}</p>
                            </div>

                            <div>
                                <span>Reason</span>
                                <p>{report.reason}</p>
                            </div>

                            {report.link && (
                                <div>
                                    <span>Link</span>
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={report.link}
                                    >
                                        {report.link}
                                    </a>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}

function User({ user }) {
    return (
        <div className={styles.user}>
            <header>
                <Avatar
                    src={user.avatar}
                    alt={user.username}
                    username={user.username}
                />

                <h3 title={user.username}>{user.username}</h3>
            </header>

            <p>
                <span title={user.email || "No email registered"}>
                    {user.email || "No email registered"}
                </span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </p>
        </div>
    );
}
