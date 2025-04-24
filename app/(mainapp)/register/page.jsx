import { redirect } from "next/navigation";
import styles from "../Auth.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { UserInput } from "@client";
import Link from "next/link";

export const metadata = {
    title: "Sign up · Alpaca",
    description: "Create a Alpaca account",
};

export default async function RegisterPage() {
    const user = await useUser({ token: (await cookies()).get("token")?.value });
    if (user) return redirect(`/me/dashboard`);

    return (
        <main className={styles.main}>
            <section className={styles.container}>
                <h2>Start your journey on Alpaca</h2>

                <UserInput isRegistering={true} />

                <div className={styles.other}>
                    Already have an acccount?{" "}
                    <Link
                        className="link"
                        href="/login"
                    >
                        Login here
                    </Link>
                </div>
            </section>
        </main>
    );
}
