import { RightContainer } from "@client";
import styles from "./Header.module.css";
import { DynamicNav } from "@server";
import { BottomDock } from "./BottomDock";
import Link from "next/link";

export async function Header({ user }) {
    const todayGoal = user ? 65 : 0;

    return (
        <div className={styles.headerWrap}>
            <div className={styles.headerTop}>
                <div className={styles.metrics}>
                    <div className={`${styles.metricPill} ${styles.streakPill}`}>
                        <span aria-hidden="true">🔥</span>
                        <span>{user ? "7 day streak" : "Start your streak"}</span>
                    </div>
                    <div className={`${styles.metricPill} ${styles.xpPill}`}>
                        <span aria-hidden="true">⭐</span>
                        <span>{user ? "1,245 XP" : "0 XP"}</span>
                    </div>
                    <div className={`${styles.metricPill} ${styles.goal}`}>
                        <span>Daily goal</span>
                        <div className={styles.goalBar} role="progressbar" aria-valuenow={todayGoal} aria-valuemin="0" aria-valuemax="100">
                            <span style={{ width: `${todayGoal}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <header className={styles.header}>
                <Link className={styles.link} href="/">
                    <span className={styles.brandBadge}>A</span>
                    <span>Alpaca Quest</span>
                </Link>

                <DynamicNav user={user} />

                <RightContainer user={user} />
            </header>

            <BottomDock user={user} />
        </div>
    );
}
