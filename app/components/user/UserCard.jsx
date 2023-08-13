"use client";

import styles from "./UserCard.module.css";

export function UserCard() {
    return (
        <div className={styles.container}>
            <div>
                <img src="" alt="" />
            </div>
            <p>{user.name}</p>
        </div>
    );
}
