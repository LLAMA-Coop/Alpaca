import styles from "./Spinner.module.css";

export function Spinner({ size = 22, margin = 0, stroke }) {
    const radius = size / 2 - 5;
    const strokeWidth = 2;

    return (
        <div
            className={styles.spinnerContainer}
            style={{ width: size, height: size, marginLeft: `${margin}px` }}
        >
            <svg
                className={styles.spinner}
                viewBox={`0 0 ${size} ${size}`}
                width={size}
                height={size}
            >
                <circle
                    className={styles.circle}
                    stroke={stroke ?? "var(--accent-fg)"}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                />
            </svg>
        </div>
    );
}
