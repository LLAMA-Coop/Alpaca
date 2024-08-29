"use client";

import styles from "./Menu.module.css";

export function Menu({ items = [], close }) {
    return (
        <ul className={styles.container}>
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
                        tabIndex={0}
                        className={`${item.danger && styles.danger}`}
                        onClick={() => {
                            item.onClick();
                            if (!item.skipClose) close();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
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
