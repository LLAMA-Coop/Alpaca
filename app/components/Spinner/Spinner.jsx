import styles from "./Spinner.module.css";

export function Spinner({ size = 20, primary = false, margin = 12 }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                marginLeft: margin,
                borderColor: primary ? "#f5f5f5A8" : "",
                borderTopColor: primary ? "var(--accent-fg)" : "",
            }}
            className={styles.spinner}
        />
    );
}
