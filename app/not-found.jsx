import styles from "./page.module.css";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>Page Not Found</h2>

                <p>
                    I'm sorry, but the address you are seeking is not valid.
                    <br />
                    Check the above navigation to see if you can find what you
                    are looking for. Or you can <Link href="/">go home</Link>
                </p>
            </div>
        </main>
    );
}
