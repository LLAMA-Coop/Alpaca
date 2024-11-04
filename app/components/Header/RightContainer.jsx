"use client";

import styles from "./RightContainer.module.css";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Profile } from "@client";
import { links } from "@/lib/nav";
import Link from "next/link";

export function RightContainer({ user }) {
    const [isClosing, setIsClosing] = useState(false);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const list = links.filter((link) => {
        if (link.auth) return user;
        return true;
    });

    function handleClose() {
        setIsClosing(true);
        document.documentElement.style.overflow = "auto";

        setTimeout(() => {
            setOpen(false);
            setIsClosing(false);
        }, 180);
    }

    function handleOpen() {
        setOpen(true);
        setTimeout(() => {
            document.documentElement.style.overflow = "hidden";
        }, 200);
    }

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 767) {
                handleClose();
            }
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={styles.container}>
            {user ? (
                <Profile
                    user={user}
                    size={44}
                />
            ) : (
                <Link
                    className="button round primary"
                    href={`/login?next=${pathname}`}
                >
                    Login
                </Link>
            )}

            {open && (
                <div
                    className={styles.menu}
                    style={{
                        animation: isClosing
                            ? `${styles.leftToRight} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                            : "",
                    }}
                >
                    <nav>
                        <ul className={styles.links}>
                            {list.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        tabIndex={link.href === pathname ? -1 : 0}
                                        onClick={(e) => {
                                            if (link.href === pathname) {
                                                e.preventDefault();
                                            }
                                            handleClose();
                                        }}
                                        className={`${styles.link} ${
                                            pathname === link.href ? styles.active : ""
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}

            <button
                className={styles.button}
                onClick={() => {
                    if (open) return handleClose();
                    handleOpen();
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    height="28"
                    width="28"
                >
                    <path d="M4 6l16 0" />
                    <path d="M4 12l16 0" />
                    <path d="M4 18l16 0" />
                </svg>
            </button>
        </div>
    );
}
