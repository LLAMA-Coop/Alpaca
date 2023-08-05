import { UserInput } from "@components/client";
import styles from "@/app/Page.module.css";

export default function LoginPage() {
    return (
        <main className={styles.main}>
            <section className={styles.authContainer}>
                <h3>Login to your account</h3>
                <UserInput isRegistering={false} />
            </section>
        </main>
    );
}
