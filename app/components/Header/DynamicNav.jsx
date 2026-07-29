"use client";

import { BookOpen, CircleUserRound, Flame, PlusCircle, Route } from "lucide-react";
import styles from "./DynamicNav.module.css";
import { usePathname } from "next/navigation";
import { links } from "@/lib/nav";
import Link from "next/link";
import { Avatar } from "@client";

const icons = {
    "/courses": BookOpen,
    "/create": PlusCircle,
    "/study": Route,
    "/daily": Flame,
};

export function DynamicNav({ user }) {
    const pathname = usePathname();

    const list = links.filter((link) => {
        if (link.auth) return user;
        return true;
    });

    return (
        <nav className={styles.nav} aria-label="Primary navigation">
            <ul>
                {list.map((link) => {
                    const Icon = icons[link.href] || BookOpen;
                    const active = pathname === link.href || pathname.startsWith(link.href + "/");

                    return (
                        <li key={link.name}>
                            <Link
                                href={link.href}
                                className={`${styles.button} ${active ? styles.active : ""}`}
                                aria-label={link.name}
                                title={link.name}
                            >
                                <Icon size={16} aria-hidden="true" />
                            </Link>
                        </li>
                    );
                })}
                <li>
                    <Link
                        href={user ? "/me/dashboard" : `/login?next=${pathname}`}
                        className={`${styles.button} ${pathname.startsWith("/me") ? styles.active : ""} ${styles.profileButton}`}
                        aria-label={user ? "Profile" : "Log in"}
                        title={user ? (user.displayName || user.username) : "Log in"}
                    >
                        {user ? (
                            <Avatar size={28} src={user.avatar} username={user.username} />
                        ) : (
                            <CircleUserRound size={18} aria-hidden="true" />
                        )}
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
