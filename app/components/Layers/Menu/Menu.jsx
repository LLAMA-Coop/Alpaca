"use client";

import styles from "./Menu.module.css";

export function Menu({ items = [], close }) {
    return (
        <ul
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            className={styles.container}
        >
            {items.map((item, index) => {
                if (item.show === false) {
                    return null;
                }

                if (item.name === "hr") {
                    return <hr key={index} />;
                }

                return (
                    <li
                        key={index}
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
