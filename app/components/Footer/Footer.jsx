import styles from "./Footer.module.css";
import Link from "next/link";
import { Github, Mail, Twitter } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            name: "Product",
            links: [
                { label: "Courses", href: "/courses" },
                { label: "Study", href: "/study" },
                { label: "Create", href: "/create" },
                { label: "Daily Train", href: "/daily" },
            ],
        },
        {
            name: "Company",
            links: [
                { label: "About", href: "/about" },
                { label: "Blog", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
            ],
        },
        {
            name: "Resources",
            links: [
                { label: "Documentation", href: "#" },
                { label: "Help Center", href: "#" },
                { label: "Community", href: "#" },
                { label: "Status", href: "#" },
            ],
        },
        {
            name: "Legal",
            links: [
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy", href: "#" },
                { label: "Cookies", href: "#" },
            ],
        },
    ];

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                {/* Top Section */}
                <div className={styles.top}>
                    <div className={styles.about}>
                        <Link href="/" className={styles.logo}>
                            Alpaca
                        </Link>
                        <p className={styles.tagline}>
                            Master your learning with intelligent sourcing, note-taking, and spaced repetition.
                        </p>
                        <div className={styles.socials}>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label="Twitter"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label="GitHub"
                            >
                                <Github size={20} />
                            </a>
                            <a
                                href="mailto:contact@alpaca.app"
                                className={styles.socialLink}
                                aria-label="Email"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className={styles.linksGrid}>
                        {footerSections.map((section) => (
                            <div key={section.name} className={styles.linkSection}>
                                <h3 className={styles.sectionTitle}>{section.name}</h3>
                                <ul className={styles.linkList}>
                                    {section.links.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className={styles.link}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className={styles.divider}></div>

                {/* Bottom Section */}
                <div className={styles.bottom}>
                    <div className={styles.copyright}>
                        <p>
                            &copy; {currentYear} Alpaca. All rights reserved. Built by{" "}
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.llama}
                            >
                                LLAMA
                            </a>
                        </p>
                    </div>
                    <div className={styles.bottomLinks}>
                        <Link href="#" className={styles.smallLink}>
                            Privacy
                        </Link>
                        <Link href="#" className={styles.smallLink}>
                            Terms
                        </Link>
                        <Link href="#" className={styles.smallLink}>
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
/*
<nav className={styles.links}>
                {footerLinks.map((link) => (
                    <ol key={encodeURI(link.category)}>
                        <div className={styles.title}>{link.category}</div>

                        {link.links.map((link, index) => (
                            <li key={`${encodeURI(link.name)}_${index}`}>
                                <Link
                                    className={`${styles.link} ${
                                        link.link === "#" ? styles.disabled : ""
                                    }`}
                                    href={link.link}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ol>
                ))}
            </nav>
*/
