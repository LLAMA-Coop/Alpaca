import styles from "./Page.module.css";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className={styles.main}>
            <h2>Page Not Found</h2>

            <section>
                <div className={styles.description}>
                    <p>
                        I'm sorry, but the address you are seeking is not valid.
                    </p>
                    <p>
                        Check the above navigation to see if you can find what
                        you are looking for.
                    </p>
                    <p>
                        Or you can <Link href="/">go home</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
