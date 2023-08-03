"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ListItem.module.css";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    faAdd,
    faSubtract,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

export function ListItem({ item, action, actionType, link, select }) {
    const [showSelect, setShowSelect] = useState(false);
    const liRef = useRef(null);

    useEffect(() => {
        if (!showSelect) return;

        const handleClickOutside = (e) => {
            if (liRef.current && !liRef.current.contains(e.target)) {
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
                    title={`${label} ${item}`}
                    aria-label={`${label} ${item}`}
                    className={styles.action}
                    onClick={(e) => {
                        e.preventDefault();
                        action();
                    }}
                    onKeyDown={(e) => {
                        if (!select) return;
                        if (e.key === "Escape") setShowSelect(false);
                    }}
                >
                    <FontAwesomeIcon
                        icon={actionType === "add" ? faAdd : faSubtract}
                    />
                </button>
            )}

            {link && !action && (
                <button tabIndex={-1} className={styles.action} title={label}>
                    <FontAwesomeIcon icon={faArrowRight} />
                </button>
            )}

            {select && showSelect && select}
        </div>
    );

    if (link)
        return (
            <li ref={liRef}>
                <Link href={link} target="_blank" className={styles.listItem}>
                    {content}
                </Link>
            </li>
        );

    return (
        <li
            ref={liRef}
            onClick={() => select && setShowSelect((prev) => !prev)}
            className={`${styles.listItem} ${select && styles.select}`}
        >
            {content}
        </li>
    );
}
