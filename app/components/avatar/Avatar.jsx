import styles from "./Avatar.module.css";
import Image from "next/image";

export function Avatar({ src, username, size = 40, outline }) {
    const letter = username?.[0]?.toUpperCase();

    return (
        <div
            className={styles.container}
            style={{
                width: size,
                height: size,
                fontSize: size / 2,
                outlineWidth: outline ? "2px" : "0px",
            }}
        >
            {src ? (
                <Image
                    alt={`Avatar for ${username}`}
                    width={size}
                    height={size}
                />
            ) : (
                <div>{letter}</div>
            )}
        </div>
    );
}
