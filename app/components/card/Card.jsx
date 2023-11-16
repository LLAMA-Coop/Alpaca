"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Card.module.css";
import { useState } from "react";
import Link from "next/link";

export function Card({
    title,
    subtitle,
    description,
    image,
    url,
    urlLabel,
    buttons,
    children,
    border,
}) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div
            className={`${styles.container} ${isFocused ? styles.focused : ""}`}
            tabIndex={0}
            onFocus={() => {
                setIsFocused(true);
            }}
            onBlur={() => {
                setIsFocused(false);
            }}
        >
            <span className={styles.span}></span>

            <div className={styles.content_container}>
                <div className={styles.content}>
                    {image && (
                        <div>
                            <img src={image} alt={title} />
                        </div>
                    )}

                    {(title || subtitle || description) && (
                        <div className={styles.textContent}>
                            {(title || subtitle) && (
                                <div>
                                    {title && (
                                        <header title={title}>
                                            {url ? (
                                                url.startsWith("http") ? (
                                                    <a href={url}>{title}</a>
                                                ) : (
                                                    <Link href={url}>
                                                        {title}
                                                    </Link>
                                                )
                                            ) : (
                                                title
                                            )}
                                        </header>
                                    )}
                                    {subtitle && <h5>{subtitle}</h5>}
                                </div>
                            )}
                            {description && (
                                <p className={styles.description}>
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    <div className={styles.childrenContent}>{children}</div>

                    {buttons?.length > 0 && (
                        <div className={styles.buttonContainer}>
                            {buttons.map((button) => {
                                if (button.link) {
                                    return (
                                        <a
                                            key={button.label}
                                            href={button.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`button ${button.color}`}
                                            style={{
                                                backgroundColor: button.color,
                                            }}
                                        >
                                            {button.label}

                                            {button.icon && (
                                                <FontAwesomeIcon
                                                    icon={button.icon}
                                                />
                                            )}
                                        </a>
                                    );
                                } else {
                                    return (
                                        <button
                                            key={button.label}
                                            className={button.color}
                                            onClick={button.onClick}
                                            style={{
                                                backgroundColor: button.color,
                                            }}
                                        >
                                            {button.label}{" "}
                                            {button.icon && (
                                                <FontAwesomeIcon
                                                    icon={button.icon}
                                                />
                                            )}
                                        </button>
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
