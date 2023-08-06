import { UserInput } from "@components/client";
import styles from "@/app/Page.module.css";
import Link from "next/link";

export default function RegisterPage() {
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
