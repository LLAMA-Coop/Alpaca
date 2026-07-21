import styles from "./page.module.css";
import Link from "next/link";
import { AlpacaSVG } from "@/app/components/AlpacaSVG";
import { AvailableCourses } from "@/app/components/Course/AvailableCourses";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function HomePage() {
    const user = await useUser({
        token: (await cookies()).get("token")?.value,
        select: ["id"],
    });

    if (user) {
        redirect("/me/dashboard");
    }

    return (
        <main className={styles.main}>
            <div className={styles.homeWrap}>
                <section className={styles.homeHero}>
                    <div className={styles.introCard}>
                        <div className={styles.heroCopy}>
                            <p className={styles.kicker}>Quest Mode</p>
                            <h1>Build streaks, earn XP, and level your skills every day.</h1>
                            <p>
                                Alpaca is now designed like a learning app: skill paths, daily missions, and tiny wins that stack into deep mastery.
                            </p>
                            <div className={styles.heroActions}>
                                <Link href="/login" className={`${styles.cta} button round primary`}>
                                    Start learning
                                </Link>
                                <Link href="/about" className={`${styles.ctaAlt} button round`}>
                                    See how it works
                                </Link>
                            </div>
                        </div>
                        <div className={styles.heroArt}>
                            <AlpacaSVG />
                            <div className={styles.floatingBadge}>+50 XP</div>
                        </div>
                    </div>
                </section>

                <section className={styles.pathSection}>
                    <header>
                        <h2>Learning Path</h2>
                        <p>Follow a route of bite-sized goals. Each completed step unlocks the next one.</p>
                    </header>

                    <div className={styles.pathMap}>
                        <div className={`${styles.node} ${styles.done}`}>
                            <span>1</span>
                            <p>Add a source</p>
                        </div>
                        <div className={styles.connector} aria-hidden="true" />
                        <div className={`${styles.node} ${styles.done}`}>
                            <span>2</span>
                            <p>Create notes</p>
                        </div>
                        <div className={styles.connector} aria-hidden="true" />
                        <div className={`${styles.node} ${styles.active}`}>
                            <span>3</span>
                            <p>Play quiz round</p>
                        </div>
                        <div className={styles.connector} aria-hidden="true" />
                        <div className={styles.node}>
                            <span>4</span>
                            <p>Complete daily mission</p>
                        </div>
                    </div>
                </section>

                <section className={styles.statsSection}>
                    <div className={styles.statCard}>
                        <h3>Daily XP Goal</h3>
                        <div className={styles.progressTrack}>
                            <span style={{ width: "74%" }} />
                        </div>
                        <p>74 / 100 XP today</p>
                    </div>
                    <div className={`${styles.statCard} ${styles.streakCard}`}>
                        <h3>Current Streak</h3>
                        <p className={styles.big}>7 days</p>
                        <Link href="/daily" className="link">Keep streak alive</Link>
                    </div>
                    <div className={`${styles.statCard} ${styles.leagueCard}`}>
                        <h3>League</h3>
                        <p className={styles.big}>Gold Learner</p>
                        <p>Top 18% this week</p>
                    </div>
                </section>

                <AvailableCourses />

                <section className={styles.modeSection}>
                    <h2>Training Modes</h2>
                    <div className={styles.modeGrid}>
                        <article>
                            <h3>Speed Review</h3>
                            <p>Quick rounds for confidence and momentum.</p>
                        </article>
                        <article className={styles.modeFocus}>
                            <h3>Deep Focus</h3>
                            <p>Long-form practice with notes and references side by side.</p>
                        </article>
                        <article className={styles.modeChallenge}>
                            <h3>Challenge Arena</h3>
                            <p>Mixed-mode questions that push retention and recall.</p>
                        </article>
                    </div>
                </section>

                <section className={styles.finalCta}>
                    <h2>Ready for your next lesson?</h2>
                    <p>Jump in, complete one mission, and let momentum do the rest.</p>
                    <Link href="/register" className={`${styles.cta} button round primary`}>
                        Create account
                    </Link>
                </section>
            </div>
        </main>
    );
}

