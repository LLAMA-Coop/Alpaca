import styles from "./DynamicNav.module.css";
import { links } from "@/lib/nav";
import Link from "next/link";

export function DynamicNav() {
    return (
        <nav className={styles.nav}>
            <ul>
                {links.map((link) => (
                    <li key={link.name}>
                        <Link href={link.href}>{link.name}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
