"use client";

import styles from "./UserCard.module.css";

export function UserCard({ user }) {
    return (
        <div className={styles.container}>
            <div>
                <img src="" alt="" />
            </div>
            <p>{user.username}</p>
        </div>
    );
}
