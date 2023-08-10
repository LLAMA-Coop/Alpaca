"use client";

import { faCog, faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { protectedPaths } from "@/app/data/paths";
import { Avatar } from "@components/client";
import styles from "./Profile.module.css";

export function Profile({ user }) {
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();
    const path = usePathname();
    const menu = useRef(null);

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
        await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (protectedPaths.includes(path)) {
            router.push("/login");
        }

        router.refresh();
    };

    return (
        <div className={styles.container}>
            <div
                className={styles.avatarContainer}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                }}
            >
                <Avatar
                    src={user.avatar}
                    username={user.username}
                    outline={showMenu}
                />
            </div>

            {showMenu && (
                <div ref={menu} className="menuPopup down left medium">
                    <ul>
                        <li
                            className="icon"
                            onClick={() => {
                                router.push("/me/dashboard");
                                setShowMenu(false);
                            }}
                        >
                            <div>
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                            My Profile
                        </li>

                        <li
                            className="icon"
                            onClick={() => {
                                router.push("/me/settings");
                                setShowMenu(false);
                            }}
                        >
                            <div>
                                <FontAwesomeIcon icon={faCog} />
                            </div>
                            Settings
                        </li>

                        <hr />

                        <li
                            className="danger icon"
                            onClick={() => {
                                logout();
                                setShowMenu(false);
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
