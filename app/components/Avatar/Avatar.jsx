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
                outline: outline ? "" : "0px solid transparent",
            }}
        >
            {src ? (
                <Image
                    alt={`Avatar for ${username}`}
                    width={size}
                    height={size}
                    src={src}
                />
            ) : (
                <div>{letter}</div>
            )}
        </div>
    );
}
