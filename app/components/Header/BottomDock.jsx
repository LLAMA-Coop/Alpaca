"use client";

import { usePathname } from "next/navigation";
import styles from "./BottomDock.module.css";
import { links } from "@/lib/nav";
import Link from "next/link";

const icons = {
    "/courses": "📚",
    "/create": "🛠",
    "/study": "🎯",
    "/daily": "🔥",
};

export function BottomDock({ user }) {
    const pathname = usePathname();

    const dockLinks = links.filter((link) => !link.auth || user);

    return (
        <nav className={styles.dock} aria-label="Primary">
            {dockLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + "/");

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`${styles.item} ${active ? styles.active : ""}`}
                    >
                        <span className={styles.emoji} aria-hidden="true">
                            {icons[link.href] || "✨"}
                        </span>
                        <span className={styles.label}>{link.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}