"use client";

import styles from "./DynamicNav.module.css";
import { usePathname } from "next/navigation";
import { links } from "@/lib/nav";
import Link from "next/link";

export function DynamicNav({ user }) {
    const pathname = usePathname();

    const list = links.filter((link) => {
        if (link.auth) return user;
        return true;
    });

    return (
        <nav className={styles.nav}>
            <ul>
                {list.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            className={pathname === link.href || pathname.startsWith(link.href + "/") ? styles.active : ""}
                        >
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
