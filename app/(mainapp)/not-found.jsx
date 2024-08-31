import styles from "./page.module.css";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>Page Not Found</h2>

                <p>
                    Unfortunately, the page you are looking for does not exist.
                    <br />
                    Check the above navigation to see if you can find what you
                    are looking for. Or you can{" "}
                    <Link className="link" href="/">
                        go home
                    </Link>
                </p>
            </div>
        </main>
    );
}
