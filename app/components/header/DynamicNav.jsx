"use client";

import styles from "./DynamicNav.module.css";
import { useState } from "react";
import Link from "next/link";
import { Profile } from "../client";

export function DynamicNav({ user }) {
    const [props, setProps] = useState({});
    const [open, setOpen] = useState(false);

    const links = [
        {
            name: "Home",
            href: "/",
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
        {
            name: "About",
            href: "/about",
        },
        {
            name: "Daily Train",
            href: "/daily",
        },
    ];

    return (
        <nav className={styles.nav}>
            <label htmlFor="menuClosed">
                <svg
                    className={styles.burger}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 6l16 0" />
                    <path d="M4 12l16 0" />
                    <path d="M4 18l16 0" />
                </svg>
            </label>
            <input
                type="checkbox"
                id="menuClosed"
                value={open}
                className={styles.menuClosed}
            />
            <ul className={styles.navMenu}>
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
                        onFocus={(e) => {
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

                <li className={styles.profile}>
                    {user ? (
                        <Profile user={user} />
                    ) : (
                        <Link href="/login">Login</Link>
                    )}
                </li>

                {/* <div className={styles.followingDiv} style={{ ...props }} /> */}
            </ul>
        </nav>
    );
}
