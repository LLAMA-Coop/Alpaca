import { RightContainer } from "@client";
import styles from "./Header.module.css";
import { DynamicNav } from "@server";
import Link from "next/link";

export async function Header({ user }) {
    return (
        <div className={styles.header}>
            <header>
                <div>
                    <Link className={styles.link} href="/">
                        Alpaca
                    </Link>
                </div>

                <DynamicNav />

                <RightContainer user={user} />
            </header>
        </div>
    );
}
