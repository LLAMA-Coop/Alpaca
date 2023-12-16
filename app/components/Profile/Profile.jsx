"use client";

import { faCog, faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { protectedPaths } from "@/app/data/paths";
import styles from "./Profile.module.css";
import { useStore } from "@/store/store";
import { Avatar, Menu } from "@client";

export function Profile({ user }) {
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();
    const path = usePathname();
    const menu = useRef(null);

    const notifications = useStore((state) => state.notifications);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (showMenu && !menu.current?.contains(e.target)) {
                setShowMenu(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowMenu(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", handleOutsideClick);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("click", handleOutsideClick);
        };
    }, [showMenu]);

    const logout = async () => {
        await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/auth/logout`,
            {
                method: "POST",
            },
        );

        if (protectedPaths.includes(path)) {
            router.push("/login");
        }

        router.refresh();
    };

    return (
        <div className={styles.container}>
            <div
                tabIndex={0}
                className={styles.avatarContainer}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.stopPropagation();
                        setShowMenu((prev) => !prev);
                    }
                }}
            >
                <Avatar
                    src={user.avatar}
                    username={user.username}
                    outline={showMenu}
                    size={44}
                />

                {!!notifications.length && (
                    <sub
                        tabIndex={0}
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push("/me/dashboard-v2");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.stopPropagation();
                                router.push("/me/dashboard-v2");
                            }
                        }}
                    >
                        {notifications.length}
                    </sub>
                )}
            </div>

            <Menu
                show={showMenu}
                setShow={setShowMenu}
                down
                left
                medium
                items={[
                    {
                        name: "Dashboard",
                        icon: (
                            <g>
                                <path d="M4 4h6v8h-6z" />
                                <path d="M4 16h6v4h-6z" />
                                <path d="M14 12h6v8h-6z" />
                                <path d="M14 4h6v4h-6z" />
                            </g>
                        ),
                        onClick: () => router.push("/me/dashboard"),
                    },
                    {
                        name: "Settings",
                        icon: (
                            <g>
                                <path
                                    d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z"
                                    stroke-width="0"
                                    fill="currentColor"
                                />
                            </g>
                        ),
                        onClick: () => router.push("/me/settings"),
                    },
                    {
                        name: "hr",
                    },
                    {
                        name: "Logout",
                        danger: true,
                        icon: (
                            <g>
                                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                                <path d="M9 12h12l-3 -3" />
                                <path d="M18 15l3 -3" />
                            </g>
                        ),
                        onClick: logout,
                    },
                ]}
            />
        </div>
    );
}
