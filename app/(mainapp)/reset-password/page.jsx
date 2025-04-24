import styles from "../page.module.css";
import { db } from "@/lib/db/db";
import { Reset } from "./Reset";

export default async function ResetPasswordPage(props) {
    const searchParams = await props.searchParams;
    const { token } = searchParams;

    const user = await db
        .selectFrom("users")
        .select(["id", "passwordResetExpiration"])
        .where("passwordReset", "=", token)
        .executeTakeFirst();

    if (!user) {
        return (
            <main className={styles.main}>
                <header>
                    <h1>Invalid token</h1>
                    <p>The token provided is invalid or has expired.</p>
                </header>
            </main>
        );
    }

    if (user.passwordResetExpiration < new Date()) {
        return (
            <main className={styles.main}>
                <header>
                    <h1>Expired token</h1>
                    <p>
                        The token provided has expired.
                        <br />
                        Please request a new one.
                    </p>
                </header>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <header>
                <h1>Reset Password</h1>
                <p>Enter your new password.</p>
            </header>

            <section>
                <Reset token={token} />
            </section>
        </main>
    );
}
