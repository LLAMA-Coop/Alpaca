import styles from './Page.module.css';
import Link from 'next/link';

export default function NotFound() {
    return (
        <main className={styles.main}>
            <h2>Oh no! The page you are looking for does not exist. </h2>

            <section>
                <div className={styles.description}>
                    <p>
                        You can always visit the <Link href='/'>homepage</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
