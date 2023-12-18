"use client";

import { Input } from "@/app/components/client";
import styles from "./Settings.module.css";
import { useRef, useState } from "react";

export function Profile({ user }) {
    const [avatar, setAvatar] = useState(null);
    const avatarInput = useRef(null);

    return (
        <div className={styles.content}>
            <div>
                <Input label="Name" />
                <Input label="Email" />
                <Input label="Username" />
                <Input label="Bio" type="textarea" />
            </div>

            <div>
                <div className={styles.avatar}>
                    <input
                        ref={avatarInput}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                setAvatar(
                                    URL.createObjectURL(e.target.files[0]),
                                );
                            }
                        }}
                    />

                    <div>
                        {user.avatar || avatar ? (
                            <img
                                src={avatar ? avatar : user.avatar}
                                alt="Avatar"
                            />
                        ) : (
                            <span>{user.username[0].toUpperCase()}</span>
                        )}

                        <button onClick={() => avatarInput.current.click()}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width={16}
                                height={16}
                                strokeWidth="2"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                            </svg>
                            <p>Edit</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
