"use client";

import {
    faCog,
    faSignOut,
    faUser,
    faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { protectedPaths } from "@/app/data/paths";
import { Avatar } from "@components/client";
import styles from "./Profile.module.css";
import { useStore } from "@/store/store";

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
                />
                {notifications.length > 0 && <sub>{notifications.length}</sub>}
            </div>

            {showMenu && (
                <div ref={menu} className="menuPopup down left medium">
                    <ul>
                        <li
                            tabIndex={0}
                            className="icon"
                            onClick={() => {
                                router.push("/me/dashboard");
                                setShowMenu(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    router.push("/me/dashboard");
                                    setShowMenu(false);
                                }
                            }}
                        >
                            <div>
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                            Profile
                        </li>

                        <li
                            tabIndex={0}
                            className="icon"
                            onClick={() => {
                                router.push("/me/settings");
                                setShowMenu(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    router.push("/me/settings");
                                    setShowMenu(false);
                                }
                            }}
                        >
                            <div>
                                <FontAwesomeIcon icon={faCog} />
                            </div>
                            Settings
                        </li>

                        <hr />

                        <li
                            tabIndex={0}
                            className="danger icon"
                            onClick={() => {
                                logout();
                                setShowMenu(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    logout();
                                    setShowMenu(false);
                                }
                            }}
                        >
                            <div>
                                <FontAwesomeIcon icon={faSignOut} />
                            </div>
                            Logout
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
