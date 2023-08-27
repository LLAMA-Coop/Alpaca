"use client";

import { faCrown, faHammer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./UserCard.module.css";
import { Avatar } from "../client";
import Link from "next/link";

export function UserCard({ user, isOwner, isAdmin }) {
    return (
        <Link className={styles.container} href={`/users/${user.username}`}>
            <Avatar username={user.username} size={32} />

            <p>{user.username}</p>

            {isOwner ? (
                <FontAwesomeIcon icon={faCrown} title="Owner" />
            ) : (
                isAdmin && <FontAwesomeIcon icon={faHammer} title="Admin" />
            )}
        </Link>
    );
}
