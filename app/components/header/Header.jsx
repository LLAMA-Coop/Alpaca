import { RightContainer } from "./RightContainer";
import { DynamicNav } from "./DynamicNav";
import styles from "./Header.module.css";
import { serializeOne } from "@/lib/db";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
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
            <RightContainer user={user} />
        </header>
    );
}
