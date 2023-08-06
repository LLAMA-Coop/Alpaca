import { UserInput } from "@components/client";
import styles from "@/app/Page.module.css";
import Link from "next/link";

export default function LoginPage() {
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
