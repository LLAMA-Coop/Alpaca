"use client";

import styles from "./RightContainer.module.css";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Profile, Avatar } from "@client";
import { links } from "@/lib/nav";
import Link from "next/link";

function getLinkIcon(href) {
    if (href === "/courses") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
    if (href === "/create") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
    );
    if (href === "/study") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
    if (href === "/daily") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
    return null;
}

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
        }, 200);
    }

    function handleOpen() {
        setOpen(true);
        document.documentElement.style.overflow = "hidden";
    }

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 900) {
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
                <>
                    <div
                        className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ""}`}
                        onClick={handleClose}
                        aria-hidden="true"
                    />
                    <div
                        className={`${styles.drawer} ${isClosing ? styles.drawerClosing : ""}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                    >
                        <div className={styles.drawerHeader}>
                            <Link href="/" onClick={handleClose} className={styles.drawerBrand}>
                                Alpaca
                            </Link>
                        </div>

                        {user && (
                            <div className={styles.drawerProfile}>
                                <Avatar
                                    size={40}
                                    src={user.avatar}
                                    username={user.username}
                                />
                                <div className={styles.drawerProfileInfo}>
                                    <span className={styles.drawerProfileName}>
                                        {user.displayName || user.username}
                                    </span>
                                    <span className={styles.drawerProfileSub}>
                                        @{user.username}
                                    </span>
                                </div>
                            </div>
                        )}

                        <nav className={styles.drawerNav}>
                            <ul className={styles.drawerLinks}>
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
                                            className={`${styles.drawerLink} ${pathname === link.href || pathname.startsWith(link.href + "/")
                                                    ? styles.active
                                                    : ""
                                                }`}
                                        >
                                            <span className={styles.drawerLinkIcon}>
                                                {getLinkIcon(link.href)}
                                            </span>
                                            <span>{link.name}</span>
                                            {(pathname === link.href || pathname.startsWith(link.href + "/")) && (
                                                <span className={styles.activeDot} aria-hidden="true" />
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {!user && (
                            <div className={styles.drawerFooter}>
                                <Link
                                    className="button round primary"
                                    href={`/login?next=${pathname}`}
                                    onClick={handleClose}
                                    style={{ width: "100%", justifyContent: "center" }}
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}

            <button
                className={styles.button}
                onClick={() => {
                    if (open) return handleClose();
                    handleOpen();
                }}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M4 6l16 0" />
                        <path d="M4 12l10 0" />
                        <path d="M4 18l14 0" />
                    </svg>
                )}
            </button>
        </div>
    );
}
