"use client";

import styles from "./DynamicNav.module.css";
import { useState } from "react";
import Link from "next/link";

export function DynamicNav() {
    const [props, setProps] = useState({});

    const links = [
        {
            name: "Home",
            href: "/",
        },
        {
            name: "About",
            href: "/about",
        },
        {
            name: "Sources",
            href: "/sources",
        },
        {
            name: "Notes",
            href: "/notes",
        },
        {
            name: "Quizzes",
            href: "/quizzes",
        },
        {
            name: "Groups",
            href: "/groups",
        },
    ];

    return (
        <menu className={styles.navMenu}>
            <div
                onMouseLeave={() => {
                    setProps((prev) => ({
                        ...prev,
                        opacity: 0,
                    }));
                }}
            >
                {links.map((link) => (
                    <li
                        key={link.name}
                        onMouseEnter={(e) => {
                            const left = e.currentTarget.offsetLeft;
                            setProps({
                                transform: `translate(${left}px, -50%)`,
                                width: e.currentTarget.offsetWidth,
                            });
                        }}
                    >
                        <Link href={link.href}>{link.name}</Link>
                    </li>
                ))}

                <div className={styles.followingDiv} style={{ ...props }} />
            </div>
        </menu>
    );
}
