"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ListItem.module.css";

export function ListItem({ item, action, actionType, link, select, disabled }) {
    const [showSelect, setShowSelect] = useState(false);
    const liRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!liRef.current?.contains(e.target)) {
                setShowSelect(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showSelect]);

    let label = "";
    if (actionType === "add" && !select) {
        label = "Add";
    } else if (actionType === "delete" && !select) {
        label = "Delete";
    } else if (!action && link) {
        label = "Open in new tab";
    }

    const content = (
        <div className={styles.itemContent}>
            <span title={item}>{item}</span>

            {action && (
                <button
                    type="button"
                    title={`${label} ${item}`}
                    aria-label={`${label} ${item}`}
                    aria-haspopup={select ? "true" : "false"}
                    aria-expanded={showSelect ? "true" : "false"}
                    aria-controls={showSelect ? `${item}-select` : null}
                    className={`${styles.action} ${
                        disabled ? styles.disabled : ""
                    }`}
                    onClick={(e) => {
                        e.preventDefault();
                        action();
                    }}
                    onKeyDown={(e) => {
                        if (!select) return;
                        if (e.key === "Escape") setShowSelect(false);
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                    >
                        {actionType === "add" ? (
                            <g>
                                <path d="M12 5l0 14" />
                                <path d="M5 12l14 0" />
                            </g>
                        ) : (
                            <path d="M5 12l14 0" />
                        )}
                    </svg>
                </button>
            )}

            {link && !action && (
                <button
                    tabIndex={-1}
                    className={`${styles.action} ${
                        disabled ? styles.disabled : ""
                    }`}
                    title={label}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                    >
                        <path d="M5 12l14 0" />
                        <path d="M15 16l4 -4" />
                        <path d="M15 8l4 4" />
                    </svg>
                </button>
            )}

            {select && showSelect && select}
        </div>
    );

    if (link)
        return (
            <li ref={liRef}>
                <a href={link} target="_blank" className={styles.listItem}>
                    {content}
                </a>
            </li>
        );

    return (
        <li
            ref={liRef}
            onClick={() => select && setShowSelect((prev) => !prev)}
            className={`${styles.listItem} ${select && styles.select} ${
                disabled ? styles.disabled : ""
            }`}
        >
            {content}
        </li>
    );
}
