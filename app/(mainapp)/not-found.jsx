import styles from "./Error.module.css";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1>It looks like you're lost!</h1>
                <p>But fear not! We're here to help you find your way.</p>

                <div className={styles.buttons}>
                    <Link className="button round primary" href="/">
                        Go back home
                    </Link>
                </div>

                <Image
                    src="/assets/404.svg"
                    alt="Not found"
                    height={400}
                    width={400}
                />
            </section>
        </main>
    );
}
