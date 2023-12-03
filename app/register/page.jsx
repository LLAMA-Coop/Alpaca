import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { UserInput } from "@client";
import Link from "next/link";

export const metadata = {
    title: "Sign up · Mneme",
    description: "Create a Mneme account",
};

export default async function RegisterPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (user) return redirect(`/me/dashboard`);

    return (
        <main className={styles.main + " " + styles.centered}>
            <section className={styles.authContainer}>
                <h3>Create a Mneme account</h3>
                <UserInput isRegistering={true} />

                <div>
                    Already have an acccount?{" "}
                    <Link href="/login">Login here</Link>
                </div>
            </section>
        </main>
    );
}
