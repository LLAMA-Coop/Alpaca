import styles from "./Footer.module.css";
import Link from "next/link";
import { Github, Mail, Twitter } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.questPanel}>
                    <div>
                        <p className={styles.label}>Daily Mission</p>
                        <h3>Finish 2 quiz rounds</h3>
                        <p className={styles.desc}>Complete your mission to keep your streak alive and collect bonus XP.</p>
                    </div>
                    <div className={styles.actions}>
                        <Link href="/daily" className={`${styles.cta} button round primary`}>
                            Continue quest
                        </Link>
                        <Link href="/courses" className={`${styles.secondary} button round`}>
                            Browse paths
                        </Link>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>&copy; {currentYear} Alpaca. Keep learning every day.</p>

                    <div className={styles.socials}>
                        <Link href="/about" className={styles.smallLink}>
                            About
                        </Link>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="Twitter"
                        >
                            <Twitter size={18} />
                        </a>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="GitHub"
                        >
                            <Github size={18} />
                        </a>
                        <a
                            href="mailto:contact@alpaca.app"
                            className={styles.socialLink}
                            aria-label="Email"
                        >
                            <Mail size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
