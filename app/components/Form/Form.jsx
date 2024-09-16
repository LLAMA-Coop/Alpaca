"use client";

import styles from "./Form.module.css";

export function Form({ children, ...props }) {
    // This is just a styled component to apply css to the form
    // It does not have any logic

    return (
        <form className={styles.form} {...props}>
            {children}
        </form>
    );
}

export function Column({ children, ...props }) {
    // This is just a styled component to apply css to the column
    // It does not have any logic

    return (
        <section className={styles.column} {...props}>
            {children}
        </section>
    );
}
