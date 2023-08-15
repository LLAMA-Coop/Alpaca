import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { useUser } from "@/lib/auth";

export default async function SettingsPage() {
    const user = await useUser();
    if (!user) return redirect("/login");

    return (
        <main className={styles.main}>
            <h2>Settings</h2>

            <section>
                <div className="paragraph">
                    <p>Hello user, here are the settings.</p>
                </div>
            </section>
        </main>
    );
}
