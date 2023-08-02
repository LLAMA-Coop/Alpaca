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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSelect]);

  let label;
  if (actionType === "add") {
    label = "Add item";
  }
  if (actionType === "delete") {
    label = "Delete item";
  }
  if (!action && link) {
    label = item;
  }

  const content = (
    <div className={styles.itemContent}>
      <span title={item}>{item}</span>

      {action && (
        <button
          className={styles.action}
          title={label}
          onClick={(e) => {
            e.preventDefault();
            action();
          }}
        >
          <FontAwesomeIcon icon={actionType === "add" ? faAdd : faSubtract} />
        </button>
      )}

      {link && !action && (
        <button className={styles.action} title={label} onClick={action}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}

      {select && showSelect && select}
    </div>
  );

  if (link)
    return (
      <li ref={liRef} onClick={() => select && setShowSelect((prev) => !prev)}>
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
