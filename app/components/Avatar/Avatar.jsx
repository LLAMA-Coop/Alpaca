import styles from "./Avatar.module.css";
import Image from "next/image";

const cdn = process.env.NEXT_PUBLIC_CDN_URL;

if (!cdn) {
    console.error("Please set NEXT_PUBLIC_CDN_URL in your .env file");
    process.exit(1);
}

export function Avatar({ src, username, size = 40, outline, background }) {
    const letter = username?.[0]?.toUpperCase();

    return (
        <div
            className={styles.container}
            style={{
                width: size,
                minWidth: size,
                height: size,
                minHeight: size,
                fontSize: size / 2.5,
                lineHeight: `${size / 3}px`,
                outline: outline ? "" : "0px solid transparent",
                background: background || "",
            }}
        >
            {src ? (
                <Image
                    width={size}
                    height={size}
                    draggable={false}
                    src={`${cdn}${src}`}
                    alt={`Avatar for ${username || "User"}`}
                />
            ) : (
                letter
            )}
        </div>
    );
}
