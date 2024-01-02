import { RightContainer } from "@client";
import styles from "./Header.module.css";
import { serializeOne } from "@/lib/db";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { DynamicNav } from "@server";
import Link from "next/link";

export async function Header() {
    const user = serializeOne(
        await useUser({ token: cookies().get("token")?.value }),
    );

    return (
        <header className={styles.header}>
            <Link href="/">Mneme</Link>

            <DynamicNav />
            <RightContainer user={user} />
        </header>
    );
}
