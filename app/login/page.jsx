import { UserInput } from "@components/client";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { useUser } from "@/lib/auth";
import Link from "next/link";

export default async function LoginPage() {
    const user = await useUser();
    if (user) return redirect(`/me/dashboard`);

    return (
        <main className={styles.main}>
            <section className={styles.authContainer}>
                <h3>Login to your account</h3>
                <UserInput isRegistering={false} />

                <Link href="/register">
                    Don't have an account? Register here
                </Link>
            </section>
        </main>
    );
}
