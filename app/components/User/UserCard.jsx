"use client";

import { Popover, PopoverContent, PopoverTrigger } from "../Layers/Popover";
import { useAlerts, useStore } from "@/store/store";
import { useRouter } from "next/navigation";
import styles from "./UserCard.module.css";
import { Avatar } from "@client";
import { useRef } from "react";
import Link from "next/link";

const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? "";

export function UserCard({ user, group, isOwner, isAdmin }) {
    const removeAssociate = useStore((state) => state.removeAssociate);
    const addAssociate = useStore((state) => state.addAssociate);
    const associates = useStore((state) => state.associates);
    const isAssociate = associates.map((a) => a.id).includes(user.id);
    const addAlert = useAlerts((state) => state.addAlert);
    const myself = useStore((state) => state.user);

    const isMe = user.id === myself.id;
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
        <div className={styles.wrapper}>
            <Link
                className={`${styles.container} ${false && styles.active}`}
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
            </Link>

            <Popover>
                <PopoverTrigger>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className={false ? styles.active : ""}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            height="18"
                            width="18"
                        >
                            <circle cx="12" cy="2" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="22" r="2" />
                        </svg>
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    isMenu
                    items={[
                        {
                            name: "View Profile",
                            onClick: () => {
                                router.push(`/users/${user.username}`);
                            },
                            icon: (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    fill="currentColor"
                                    x="0px"
                                    y="0px"
                                >
                                    <g>
                                        <circle cx="256" cy="128" r="128" />
                                        <path d="M256,298.667c-105.99,0.118-191.882,86.01-192,192C64,502.449,73.551,512,85.333,512h341.333   c11.782,0,21.333-9.551,21.333-21.333C447.882,384.677,361.99,298.784,256,298.667z" />
                                    </g>
                                </svg>
                            ),
                        },
                        {
                            name: "Send Message",
                            onClick: () => {},
                            icon: (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M8.7,18H3c-1.493,0-3-1.134-3-3.666V9.294A9.418,9.418,0,0,1,8.349.023a9,9,0,0,1,9.628,9.628A9.419,9.419,0,0,1,8.7,18ZM20,9.08h-.012c0,.237,0,.474-.012.712C19.59,15.2,14.647,19.778,9.084,19.981l0,.015A8,8,0,0,0,16,24h5a3,3,0,0,0,3-3V16A8,8,0,0,0,20,9.08Z" />
                                </svg>
                            ),
                            show: !isMe,
                        },
                        {
                            name: "hr",
                            show: !isMe,
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="m24 12a1 1 0 0 1 -1 1h-6a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1zm-15 0a6 6 0 1 0 -6-6 6.006 6.006 0 0 0 6 6zm0 2a9.01 9.01 0 0 0 -9 9 1 1 0 0 0 1 1h16a1 1 0 0 0 1-1 9.01 9.01 0 0 0 -9-9z" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    fill="currentColor"
                                    x="0px"
                                    y="0px"
                                >
                                    <g>
                                        <path d="M490.667,234.667H448V192c0-11.782-9.551-21.333-21.333-21.333c-11.782,0-21.333,9.551-21.333,21.333v42.667h-42.667   c-11.782,0-21.333,9.551-21.333,21.333c0,11.782,9.551,21.333,21.333,21.333h42.667V320c0,11.782,9.551,21.333,21.333,21.333   c11.782,0,21.333-9.551,21.333-21.333v-42.667h42.667c11.782,0,21.333-9.551,21.333-21.333   C512,244.218,502.449,234.667,490.667,234.667z" />
                                        <circle cx="192" cy="128" r="128" />
                                        <path d="M192,298.667c-105.99,0.118-191.882,86.01-192,192C0,502.449,9.551,512,21.333,512h341.333   c11.782,0,21.333-9.551,21.333-21.333C383.882,384.677,297.99,298.784,192,298.667z" />
                                    </g>
                                </svg>
                            ),
                            show: !isMe,
                        },
                        {
                            name: "Remove From Group",
                            onClick: () => {},
                            icon: (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="m18,12c-3.314,0-6,2.686-6,6s2.686,6,6,6,6-2.686,6-6-2.686-6-6-6Zm2.5,7h-5c-.553,0-1-.447-1-1s.447-1,1-1h5c.553,0,1,.447,1,1s-.447,1-1,1ZM4.5,2.5c0-1.381,1.119-2.5,2.5-2.5s2.5,1.119,2.5,2.5-1.119,2.5-2.5,2.5-2.5-1.119-2.5-2.5Zm7.5,7.5c0-2.206-1.794-4-4-4h-2c-2.206,0-4,1.794-4,4v3c0,1.478.805,2.771,2,3.463v6.537c0,.553.447,1,1,1s1-.447,1-1v-6h2v6c0,.553.447,1,1,1s1-.447,1-1v-5c0-2.029.755-3.881,2-5.291v-2.709Z" />
                                </svg>
                            ),
                            show: !!group || !isMe,
                        },
                        {
                            name: "Block User",
                            onClick: () => {},
                            icon: (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M18,12c-3.309,0-6,2.691-6,6s2.691,6,6,6,6-2.691,6-6-2.691-6-6-6Zm4,6c0,.74-.216,1.424-.567,2.019l-5.452-5.453c.595-.351,1.279-.567,2.019-.567,2.206,0,4,1.794,4,4Zm-8,0c0-.74,.216-1.424,.567-2.019l5.452,5.453c-.595,.351-1.279,.567-2.019,.567-2.206,0-4-1.794-4-4Zm-5-6c3.309,0,6-2.691,6-6S12.309,0,9,0,3,2.691,3,6s2.691,6,6,6Zm3.721,12H1c-.553,0-1-.448-1-1,0-4.962,4.037-9,9-9,.67,0,1.321,.079,1.95,.219-.605,1.126-.95,2.413-.95,3.781,0,2.393,1.056,4.534,2.721,6Z" />
                                </svg>
                            ),
                            danger: true,
                            show: !isMe,
                        },
                        {
                            name: "hr",
                            show: !isMe,
                        },
                        {
                            name: "Copy Profile Link",
                            onClick: async () => {
                                await navigator.clipboard.writeText(
                                    `${window.location.origin}/users/${user.username}`,
                                );
                            },
                            icon: (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 511.904 511.904"
                                    fill="currentColor"
                                    x="0px"
                                    y="0px"
                                >
                                    <g>
                                        <path d="M222.025,417.764c-33.872,35.124-89.034,38.364-126.784,7.445c-22.482-19.465-33.966-48.733-30.72-78.293   c2.811-21.794,12.997-41.97,28.864-57.173l61.355-61.397c12.492-12.496,12.492-32.752,0-45.248l0,0   c-12.496-12.492-32.752-12.492-45.248,0l-60.053,60.075C22.065,269.57,4.802,304.721,0.649,342.521   c-7.757,85.138,54.972,160.445,140.11,168.202c45.721,4.166,90.933-12.179,123.42-44.618l64.171-64.149   c12.492-12.496,12.492-32.752,0-45.248l0,0c-12.496-12.492-32.752-12.492-45.248,0L222.025,417.764z" />
                                        <path d="M451.358,31.289C387.651-15.517,299.186-8.179,244.062,48.484L183.667,108.9c-12.492,12.496-12.492,32.752,0,45.248l0,0   c12.496,12.492,32.752,12.492,45.248,0l61.355-61.291c33.132-34.267,86.738-38.127,124.437-8.96   c38.803,31.818,44.466,89.067,12.648,127.87c-1.862,2.271-3.833,4.45-5.907,6.53l-64.171,64.171   c-12.492,12.496-12.492,32.752,0,45.248l0,0c12.496,12.492,32.752,12.492,45.248,0l64.171-64.171   c60.413-60.606,60.257-158.711-0.349-219.124C461.638,39.727,456.631,35.341,451.358,31.289z" />
                                        <path d="M183.667,282.525l99.425-99.425c12.497-12.497,32.758-12.497,45.255,0l0,0c12.497,12.497,12.497,32.758,0,45.255   l-99.425,99.425c-12.497,12.497-32.758,12.497-45.255,0l0,0C171.17,315.283,171.17,295.022,183.667,282.525z" />
                                    </g>
                                </svg>
                            ),
                        },
                        {
                            name: "hr",
                        },
                        {
                            name: "Report User",
                            onClick: () => {},
                            icon: (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="m1 24a1 1 0 0 1 -1-1v-19a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v5a4 4 0 0 1 -4 4h-9v10a1 1 0 0 1 -1 1zm19-20h-3v5a6.006 6.006 0 0 1 -6 6h-.444a3.987 3.987 0 0 0 3.444 2h6a4 4 0 0 0 4-4v-5a4 4 0 0 0 -4-4z" />
                                </svg>
                            ),
                            danger: true,
                        },
                    ]}
                />
            </Popover>
        </div>
    );
}
