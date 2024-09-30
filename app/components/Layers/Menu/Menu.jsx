"use client";

import styles from "./Menu.module.css";
import { nanoid } from "nanoid";

export function Menu({ items = [], close }) {
    return (
        <ul
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            className={styles.container}
        >
            {items.map((item) => {
                if (!item || item.show === false) {
                    return null;
                }

                if (item.name === "hr") {
                    return <hr key={nanoid()} />;
                }

                if (item.username) {
                    return (
                        <p
                            key={nanoid()}
                            className={styles.small}
                        >
                            <span>{item.username}</span>
                            {item.email && <span>{item.email}</span>}
                        </p>
                    );
                }

                return (
                    <li
                        key={nanoid()}
                        tabIndex={item.disabled ? -1 : 0}
                        className={`${item.danger ? styles.danger : ""} ${item.disabled ? styles.disabled : ""}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (item.disabled) return;
                            item.onClick();
                            if (!item.skipClose) close();
                        }}
                        onKeyDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (e.key === "Enter") {
                                if (item.disabled) return;
                                item.onClick();
                                if (!item.skipClose) close();
                            }
                        }}
                    >
                        {!!item.icon && item.icon}
                        {item.name}
                    </li>
                );
            })}
        </ul>
    );
}
