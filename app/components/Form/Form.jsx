"use client";

import styles from "./Form.module.css";

export function Form({ className, gap = 40, fullWidth, singleColumn, children, ...props }) {
    // This is just a styled component to apply css to the form
    // It does not have any logic

    return (
        <form
            style={{
                gap: `${gap}px`,
                width: fullWidth ? "100%" : "",
                gridTemplateColumns: singleColumn ? "1fr" : "",
            }}
            className={`${styles.form} ${className}`}
            {...props}
        >
            {children}
        </form>
    );
}

export function FormButtons({ right, children, ...props }) {
    // This is just a styled component to apply css to the form buttons
    // It does not have any logic

    return (
        <div
            className={`${styles.buttons} ${right ? styles.right : ""}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function Column({ gap, children, ...props }) {
    // This is just a styled component to apply css to the column
    // It does not have any logic

    return (
        <section
            className={styles.column}
            style={{ gap: gap ? `${gap}px` : "" }}
            {...props}
        >
            {children}
        </section>
    );
}
