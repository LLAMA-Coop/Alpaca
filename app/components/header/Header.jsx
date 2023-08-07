import { Profile } from "@components/client";
import { DynamicNav } from "./DynamicNav";
import styles from "./Header.module.css";
import { useUser } from "@/lib/auth";
import Link from "next/link";

export async function Header() {
    const user = await useUser();

    return (
        <header className={styles.header}>
            <div>
                <h1>
                    <Link href="/">Mneme</Link>
                </h1>

                <nav>
                    <DynamicNav />
                </nav>

                {user ? (
                    <Profile user={user} />
                ) : (
                    <div>
                        <Link href="/login">Login</Link>
                    </div>
                )}
            </div>
        </header>
    );
}
