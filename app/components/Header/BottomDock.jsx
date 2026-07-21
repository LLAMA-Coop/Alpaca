"use client";

import { BookOpen, Flame, PlusCircle, Route, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./BottomDock.module.css";
import { links } from "@/lib/nav";
import Link from "next/link";

const icons = {
    "/courses": BookOpen,
    "/create": PlusCircle,
    "/study": Route,
    "/daily": Flame,
};

export function BottomDock({ user }) {
    const pathname = usePathname();

    const dockLinks = links.filter((link) => !link.auth || user);

    return (
        <nav className={styles.dock} aria-label="Primary navigation">
            {dockLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + "/");
                const Icon = icons[link.href] || Sparkles;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`${styles.item} ${active ? styles.active : ""}`}
                        aria-label={link.name}
                        title={link.name}
                    >
                        <Icon size={19} aria-hidden="true" />
                    </Link>
                );
            })}
        </nav>
    );
}
