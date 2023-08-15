import { Profile } from "@components/client";
import { DynamicNav } from "./DynamicNav";
import styles from "./Header.module.css";
import { serializeOne } from "@/lib/db";
import { useUser } from "@/lib/auth";
import Link from "next/link";

export async function Header() {
    const user = serializeOne(await useUser());

    return (
        <header className={styles.header}>
            <div>
                <h1>
                    <Link href="/">Mneme</Link>
                </h1>

                <nav>
                    <DynamicNav />
                </nav>

                <div className={styles.rightContainer}>
                    {user ? (
                        <Profile user={user} />
                    ) : (
                        <div>
                            <Link href="/login">Login</Link>
                        </div>
                    )}

                    <div className={styles.burger}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 6l16 0" />
                            <path d="M4 12l16 0" />
                            <path d="M4 18l16 0" />
                        </svg>
                    </div>
                </div>
            </div>
        </header>
    );
}
