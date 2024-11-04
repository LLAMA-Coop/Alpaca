import styles from "./DynamicNav.module.css";
import { links } from "@/lib/nav";
import Link from "next/link";

export function DynamicNav({ user }) {
    const list = links.filter((link) => {
        if (link.auth) return user;
        return true;
    });

    return (
        <nav className={styles.nav}>
            <ul>
                {list.map((link) => (
                    <li key={link.name}>
                        <Link href={link.href}>{link.name}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
