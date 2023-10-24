import { Profile } from "@components/client";
import { DynamicNav } from "./DynamicNav";
import styles from "./Header.module.css";
import { serializeOne } from "@/lib/db";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import Link from "next/link";

export async function Header() {
    const user = serializeOne(
        await useUser({ token: cookies().get("token")?.value }),
    );

    return (
        <header className={styles.header}>
            <h1>
                <Link href="/">Mneme</Link>
            </h1>

            <DynamicNav user={user} />

            <div className={styles.profile}>
                {user ? (
                    <Profile user={user} />
                ) : (
                    <Link href="/login">Login</Link>
                )}
            </div>
        </header>
    );
}
