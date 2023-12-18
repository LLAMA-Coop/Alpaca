"use client";

import styles from "./Menu.module.css";

export function Menu({
    show,
    setShow,
    items,
    fit,
    medium,
    left,
    down,
    active,
    activeIcon,
    keepOpen,
}) {
    return (
        <div
            className={`${styles.container} ${fit && styles.fit} ${
                medium && styles.medium
            } ${left && styles.left} ${down && styles.down}`}
            style={{ display: show ? "block" : "none" }}
        >
            <ul>
                {items.map((item, index) => {
                    if (item.name === "hr") {
                        return <hr key={index} />;
                    } else {
                        return (
                            <li
                                key={index}
                                tabIndex={0}
                                className={`${item.danger && styles.danger} ${
                                    item.icon && styles.icon
                                }`}
                                onClick={() => {
                                    item.onClick();
                                    if (keepOpen) return;
                                    setShow(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        item.onClick();
                                        if (keepOpen) return;
                                        setShow(false);
                                    }
                                }}
                            >
                                {item.icon && (
                                    <div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            {item.icon}
                                        </svg>
                                    </div>
                                )}

                                {item.name}

                                {active === index && activeIcon}
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
}
