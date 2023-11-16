import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { UserInput } from "@client";
import Link from "next/link";

export default async function LoginPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
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
