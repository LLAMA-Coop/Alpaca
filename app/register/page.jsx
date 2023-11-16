import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { UserInput } from "@client";
import Link from "next/link";

export default async function RegisterPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (user) return redirect(`/me/dashboard`);

    return (
        <main className={styles.main}>
            <section className={styles.authContainer}>
                <h3>Register a new account</h3>
                <UserInput isRegistering={true} />

                <Link href="/login">Already have an account? Login here</Link>
            </section>
        </main>
    );
}
