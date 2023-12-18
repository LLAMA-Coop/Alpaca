import styles from "@/app/Auth.module.css";
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
        <main className={styles.main}>
            <section className={styles.container}>
                <h2>Create a Mneme account</h2>
                <UserInput isRegistering={true} />

                <div>
                    Already have an acccount?{" "}
                    <Link href="/login">Login here</Link>
                </div>
            </section>
        </main>
    );
}
