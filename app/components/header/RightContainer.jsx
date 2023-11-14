"use client";

import styles from "./RightContainer.module.css";
import { Profile } from "@components/client";
import { useState, useEffect } from "react";
import { links } from "@/lib/nav";
import Link from "next/link";

export function RightContainer({ user }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {}, [open]);

    return (
        <div className={styles.container}>
            {user ? <Profile user={user} /> : <Link href="/login">Login</Link>}

            {open && (
                <div className={styles.menu}>
                    <button onClick={() => setOpen(!open)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            stroke-width="2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6l-12 12" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </button>

                    <nav>
                        <ul>
                            {links.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href}>{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}

            <button onClick={() => setOpen(!open)} className={styles.button}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    strokeWidth="2"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 6l16 0" />
                    <path d="M4 12l16 0" />
                    <path d="M4 18l16 0" />
                </svg>
            </button>
        </div>
    );
}
