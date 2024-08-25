"use client";

import { useAlerts, useMenu, useStore } from "@/store/store";
import { useRouter } from "next/navigation";
import styles from "./UserCard.module.css";
import { Avatar } from "@client";
import { useRef } from "react";
import Link from "next/link";

const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? "";

export function UserCard({ user, group, isOwner, isAdmin }) {
    const setMenu = useMenu((state) => state.setMenu);
    const menu = useMenu((state) => state.menu);

    const removeAssociate = useStore((state) => state.removeAssociate);
    const addAssociate = useStore((state) => state.addAssociate);
    const associates = useStore((state) => state.associates);
    const isAssociate = associates.map((a) => a.id).includes(user.id);
    const addAlert = useAlerts((state) => state.addAlert);
    const myself = useStore((state) => state.user);

    const button = useRef(null);
    const router = useRouter();

    async function requestAssociate(userId) {
        const response = await fetch(`${basePath}/api/associates`, {
            method: "POST",
            body: JSON.stringify({ userId }),
        }).then((res) => res.json());

        if (response.associate) {
            addAssociate(response.associate);
        }

        addAlert({
            success: response.success,
            message: response.message,
        });
    }

    async function tryRemoveAssociate(userId) {
        const response = await fetch(`${basePath}/api/associates/${userId}`, {
            method: "DELETE",
        }).then((res) => res.json());

        if (response.success) {
            removeAssociate(userId);
        }

        addAlert({
            success: response.success,
            message: response.message,
        });
    }

    return (
        <Link
            className={`${styles.container} ${
                button.current === menu?.element && styles.active
            }`}
            href={`/users/${user.username}`}
        >
            <div className={styles.avatar}>
                <Avatar
                    src={user.avatar}
                    username={user.username}
                    size={80}
                    background="var(--bg-2)"
                />
            </div>

            <div>
                <h3>
                    {user.username}

                    {(isOwner || isAdmin) && (
                        <span
                            className={styles.owner}
                            title={isOwner ? "Group Owner" : "Group Admin"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                            >
                                {isOwner && (
                                    <path
                                        className="fill"
                                        d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"
                                    />
                                )}

                                {isAdmin && !isOwner && (
                                    <path
                                        d="M11.884 2.007l.114 -.007l.118 .007l.059 .008l.061 .013l.111 .034a.993 .993 0 0 1 .217 .112l.104 .082l.255 .218a11 11 0 0 0 7.189 2.537l.342 -.01a1 1 0 0 1 1.005 .717a13 13 0 0 1 -9.208 16.25a1 1 0 0 1 -.502 0a13 13 0 0 1 -9.209 -16.25a1 1 0 0 1 1.005 -.717a11 11 0 0 0 7.531 -2.527l.263 -.225l.096 -.075a.993 .993 0 0 1 .217 -.112l.112 -.034a.97 .97 0 0 1 .119 -.021z"
                                        strokeWidth="0"
                                        fill="currentColor"
                                    />
                                )}
                            </svg>
                        </span>
                    )}
                </h3>

                <p title={user.description || "No description provided."}>
                    {user.description || "No description provided."}
                </p>
            </div>

            <button
                ref={button}
                className={
                    button.current === menu?.element ? styles.active : ""
                }
                onClick={(e) => {
                    e.preventDefault();
                    if (menu?.element !== e.currentTarget) {
                        setMenu({
                            element: e.currentTarget,
                            items: [
                                {
                                    name: "View Profile",
                                    onClick: () => {
                                        router.push(`/users/${user.username}`);
                                    },
                                    icon: (
                                        <g>
                                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                                        </g>
                                    ),
                                },
                                {
                                    name: isAssociate
                                        ? "Remove Associate"
                                        : "Add As Associate",
                                    onClick: () => {
                                        if (isAssociate) {
                                            tryRemoveAssociate(user.id);
                                        } else {
                                            requestAssociate(user.id);
                                        }
                                    },
                                    icon: isAssociate ? (
                                        <g>
                                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4c.348 0 .686 .045 1.009 .128" />
                                            <path d="M16 19h6" />
                                        </g>
                                    ) : (
                                        <g>
                                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                            <path d="M16 19h6" />
                                            <path d="M19 16v6" />
                                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                                        </g>
                                    ),
                                    show: myself.id !== user.id,
                                },
                                // {
                                //     name: "Send Message",
                                //     onClick: () => {},
                                //     icon: (
                                //         <path
                                //             d="M5.821 4.91c3.898 -2.765 9.469 -2.539 13.073 .536c3.667 3.127 4.168 8.238 1.152 11.897c-2.842 3.447 -7.965 4.583 -12.231 2.805l-.232 -.101l-4.375 .931l-.075 .013l-.11 .009l-.113 -.004l-.044 -.005l-.11 -.02l-.105 -.034l-.1 -.044l-.076 -.042l-.108 -.077l-.081 -.074l-.073 -.083l-.053 -.075l-.065 -.115l-.042 -.106l-.031 -.113l-.013 -.075l-.009 -.11l.004 -.113l.005 -.044l.02 -.11l.022 -.072l1.15 -3.451l-.022 -.036c-2.21 -3.747 -1.209 -8.392 2.411 -11.118l.23 -.168z"
                                //             strokeWidth="0"
                                //             className="fill noStroke"
                                //         />
                                //     ),
                                // },
                                {
                                    name: "Remove From Group",
                                    onClick: () => {},
                                    icon: (
                                        <g>
                                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4c.348 0 .686 .045 1.009 .128" />
                                            <path d="M16 19h6" />
                                        </g>
                                    ),
                                    show: !!group,
                                },
                                // {
                                //     name: "Block User",
                                //     onClick: () => {},
                                //     icon: (
                                //         <g>
                                //             <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                //             <path d="M6 21v-2a4 4 0 0 1 4 -4h3.5" />
                                //             <path d="M22 22l-5 -5" />
                                //             <path d="M17 22l5 -5" />
                                //         </g>
                                //     ),
                                // },
                                {
                                    name: "Copy Profile Link",
                                    onClick: async () => {
                                        await navigator.clipboard.writeText(
                                            `${window.location.origin}/users/${user.username}`,
                                        );
                                    },
                                    icon: (
                                        <g>
                                            <path d="M9 15l6 -6" />
                                            <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
                                            <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
                                        </g>
                                    ),
                                },
                                // {
                                //     name: "Report User",
                                //     onClick: () => {},
                                //     icon: (
                                //         <g>
                                //             <path
                                //                 d="M4 5a1 1 0 0 1 .3 -.714a6 6 0 0 1 8.213 -.176l.351 .328a4 4 0 0 0 5.272 0l.249 -.227c.61 -.483 1.527 -.097 1.61 .676l.005 .113v9a1 1 0 0 1 -.3 .714a6 6 0 0 1 -8.213 .176l-.351 -.328a4 4 0 0 0 -5.136 -.114v6.552a1 1 0 0 1 -1.993 .117l-.007 -.117v-16z"
                                //                 stroke-width="0"
                                //                 fill="currentColor"
                                //             />
                                //         </g>
                                //     ),
                                // },
                            ],
                            bottom: true,
                            left: true,
                        });
                    } else {
                        setMenu(null);
                    }
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                </svg>
            </button>
        </Link>
    );
}
