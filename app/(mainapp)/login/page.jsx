import { redirect } from "next/navigation";
import styles from "../Auth.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { UserInput } from "@client";
import Link from "next/link";

export const metadata = {
    title: "Login · Alpaca",
    description: "Log in to Alpaca",
};

export default async function LoginPage(props) {
    const searchParams = await props.searchParams;
    const user = await useUser({ token: (await cookies()).get("token")?.value });

    if (user) {
        const { next } = searchParams;

        if (next) return redirect(next);
        else return redirect("/me/dashboard");
    }

    return (
        <main className={styles.main}>
            <section className={styles.container}>
                <h2>Log in to Alpaca</h2>

                <UserInput isRegistering={false} />

                <div className={styles.other}>
                    Don't have an account?{" "}
                    <Link
                        className="link"
                        href="/register"
                    >
                        Register here
                    </Link>
                </div>
            </section>
        </main>
    );
}
