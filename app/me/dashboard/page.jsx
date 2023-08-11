import { redirect } from "next/navigation";
import styles from "@/app/Page.module.css";
import { useUser } from "@/lib/auth";

export default async function DashboardPage() {
    const user = await useUser();
    if (!user) return redirect("/login");

    return (
        <main className={styles.main}>
            <h2>Dashboard</h2>

            <section>
                <div className="paragraph">
                    <p>Hello user, here's your account!</p>
                </div>
            </section>
        </main>
    );
}
