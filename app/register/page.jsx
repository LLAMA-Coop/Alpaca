import { UserInput } from "@components/client";
import styles from "@/app/Page.module.css";

export default function RegisterPage() {
    return (
        <main className={styles.main}>
            <section className={styles.authContainer}>
                <h3>Register a new account</h3>
                <UserInput isRegistering={true} />
            </section>
        </main>
    );
}
