import styles from "@/app/Auth.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { UserInput } from "@client";
import Link from "next/link";

export const metadata = {
    title: "Login · Mneme",
    description: "Log in to Mneme",
};

export default async function LoginPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (user) return redirect(`/me/dashboard`);

    return (
        <main className={styles.main}>
            <section className={styles.container}>
                <h2>Log in to Mneme</h2>
                <UserInput isRegistering={false} />

                <div>
                    Don't have an account?{" "}
                    <Link className="link" href="/register">
                        Register here
                    </Link>
                </div>
            </section>
        </main>
    );
}
