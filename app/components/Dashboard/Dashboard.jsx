"use client";

import { Notifications, Profile, Popover, PopoverTrigger, PopoverContent } from "@client";
import { CourseProgressCard } from "../Progress/ProgressBar";
import styles from "./Dashboard.module.css";
import { useStore } from "@/store/store";
import { usePathname } from "next/navigation";
import Link from "next/link";

const DAILY_GOAL_MINUTES = 5;

const NAV_LINKS = [
    { href: "/me/dashboard", label: "Home", icon: "🏠" },
    { href: "/courses", label: "My Courses", icon: "📚" },
    { href: "/daily", label: "Daily Review", icon: "🔁" },
    { href: "/me/dashboard#continue-learning", label: "Progress", icon: "📈" },
    { href: "/me/dashboard#leaderboard", label: "Leaderboard", icon: "🏆" },
    { href: "/me/dashboard#badges", label: "Badges", icon: "🎖️" },
    { href: "/create", label: "Notes", icon: "📝" },
    { href: "/me/settings", label: "Settings", icon: "⚙️" },
];

function formatMinutes(seconds) {
    return Math.round(seconds / 60);
}

function getDifficulty(level) {
    if (level <= 1) return { label: "Hard", tone: styles.toneDanger };
    if (level <= 3) return { label: "Medium", tone: styles.toneWarning };
    return { label: "Easy", tone: styles.toneSuccess };
}

function computeBadges({ streak, xp, coursesCount }) {
    return [
        { id: "streak-3", label: "3 Day Streak", icon: "🔥", achieved: streak.currentStreak >= 3 },
        { id: "streak-7", label: "7 Day Streak", icon: "🔥", achieved: streak.currentStreak >= 7 },
        { id: "streak-30", label: "30 Day Legend", icon: "🏅", achieved: streak.longestStreak >= 30 },
        { id: "xp-100", label: "100 XP Club", icon: "⭐", achieved: xp.xp >= 100 },
        { id: "xp-500", label: "500 XP Club", icon: "🌟", achieved: xp.xp >= 500 },
        { id: "course-1", label: "First Course", icon: "📚", achieved: coursesCount >= 1 },
        { id: "course-3", label: "Course Collector", icon: "🎓", achieved: coursesCount >= 3 },
    ];
}

export function PersonalDashboard({
    user,
    streak,
    xp,
    todaySeconds,
    leaderboard,
    calendar,
    courses,
    progressMap,
    dueQuizzes,
}) {
    const pathname = usePathname();
    const notifications = useStore((state) => state.notifications);

    const todayMinutes = Math.min(formatMinutes(todaySeconds), DAILY_GOAL_MINUTES);
    const goalMet = todayMinutes >= DAILY_GOAL_MINUTES;
    const goalSteps = Array.from({ length: DAILY_GOAL_MINUTES }, (_, i) => i + 1);
    const badges = computeBadges({ streak, xp, coursesCount: courses.length });
    const isInLeaderboard = leaderboard.some((entry) => entry.id === user.id);

    return (
        <div className={styles.dashboard}>
            <aside className={styles.sidebar}>
                <Link href="/" className={styles.brand}>
                    <span className={styles.brandMark} aria-hidden="true">🦙</span>
                    <span className={styles.brandText}>
                        Alpaca
                        <small>5 min. prep. Lifelong memory.</small>
                    </span>
                </Link>

                <nav className={styles.sideNav}>
                    {NAV_LINKS.map((link) => {
                        const cleanHref = link.href.split("#")[0];
                        const active = pathname === cleanHref;

                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`${styles.sideLink} ${active ? styles.sideLinkActive : ""}`}
                            >
                                <span aria-hidden="true">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <Link href="/daily" className={styles.promoCard}>
                    <span className={styles.promoBadge}>New</span>
                    <h4>Daily Review is live!</h4>
                    <p>Get a personalized {DAILY_GOAL_MINUTES}-minute review, powered by spaced repetition.</p>
                    <span className={styles.promoCta}>Try it now →</span>
                </Link>

                <Link href="/courses" className={`${styles.promoCard} ${styles.promoCardAlt}`}>
                    <h4>Explore new courses</h4>
                    <p>Discover courses created by the community and keep leveling up.</p>
                    <span className={styles.promoCta}>Browse courses →</span>
                </Link>
            </aside>

            <div className={styles.content}>
                <header className={styles.topbar}>
                    <div className={styles.tabs}>
                        <Link
                            href="/me/dashboard"
                            className={`${styles.tab} ${pathname === "/me/dashboard" ? styles.tabActive : ""}`}
                        >
                            Study
                        </Link>
                        <Link href="/courses" className={styles.tab}>
                            Explore
                        </Link>
                    </div>

                    <div className={styles.topbarRight}>
                        <div className={`${styles.metric} ${styles.metricGold}`}>
                            <span aria-hidden="true">🔥</span>
                            {streak.currentStreak}
                        </div>
                        <div className={`${styles.metric} ${styles.metricPurple}`}>
                            <span aria-hidden="true">💎</span>
                            {xp.xp}
                        </div>

                        <Popover>
                            <PopoverTrigger>
                                <button className={styles.bellButton} aria-label="Notifications">
                                    🔔
                                    {notifications.length > 0 && (
                                        <span className={styles.bellDot}>{notifications.length}</span>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className={styles.notifPanel}>
                                    {notifications.length > 0 ? (
                                        <Notifications />
                                    ) : (
                                        <p className={styles.emptyNote}>You're all caught up!</p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Profile user={user} size={38} />
                    </div>
                </header>

                <main className={styles.main}>
                    <Link href="/courses" className={styles.adBanner}>
                        <div>
                            <h3>Build real skills. Track real progress.</h3>
                            <p>Jump into a new course and start your next streak-building session.</p>
                        </div>
                        <span className="button primary round">Explore Courses</span>
                    </Link>

                    <div className={styles.welcome}>
                        <h1>Welcome back, {user.displayName || user.username}! 👋</h1>
                        <p>Let's make today a {DAILY_GOAL_MINUTES}-minute win.</p>
                    </div>

                    <div className={styles.goalCard}>
                        <div className={styles.goalHeader}>
                            <span className={styles.goalIcon} aria-hidden="true">🎯</span>
                            <div>
                                <h3>Daily Goal</h3>
                                <p className={styles.goalNumbers}>{todayMinutes} / {DAILY_GOAL_MINUTES} min</p>
                            </div>

                            <div className={styles.currentStreakChip}>
                                <span>Current Streak</span>
                                <strong>🔥 {streak.currentStreak} {streak.currentStreak === 1 ? "day" : "days"}</strong>
                                <small>Best: {streak.longestStreak} days</small>
                            </div>
                        </div>

                        <div className={styles.goalTrack}>
                            {goalSteps.map((step) => (
                                <div key={step} className={styles.goalStep}>
                                    <span className={`${styles.goalDot} ${todayMinutes >= step ? styles.goalDotDone : ""}`}>
                                        {todayMinutes >= step ? "✓" : step}
                                    </span>
                                    <small>{step} min</small>
                                </div>
                            ))}
                        </div>

                        {goalMet && <p className={styles.goalComplete}>Goal completed! 🎉</p>}
                    </div>

                    <section id="continue-learning" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Continue Learning</h2>
                            <Link href="/courses" className="link">View all courses →</Link>
                        </div>

                        {courses.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>You haven't joined any courses yet.</p>
                                <Link href="/courses" className="button primary round">Explore courses</Link>
                            </div>
                        ) : (
                            <div className={styles.courseGrid}>
                                {courses.slice(0, 3).map((course) => {
                                    const progress = progressMap[course.id] || { completedCount: 0, totalCount: 0 };

                                    return (
                                        <Link key={course.id} href={`/courses/${course.name}`} className={styles.courseCard}>
                                            <CourseProgressCard
                                                course={course}
                                                completed={progress.completedCount}
                                                total={progress.totalCount || 1}
                                            />
                                        </Link>
                                    );
                                })}

                                <Link href="/courses" className={styles.courseCardGhost}>
                                    <span>+</span>
                                    Explore more courses
                                </Link>
                            </div>
                        )}
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Today's Review</h2>
                            <span className={styles.sectionMeta}>{dueQuizzes.length} items</span>
                        </div>

                        {dueQuizzes.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>Nothing due right now. Great job staying on top of things!</p>
                                <Link href="/daily" className="button round">Practice anyway</Link>
                            </div>
                        ) : (
                            <div className={styles.reviewList}>
                                {dueQuizzes.map((quiz) => {
                                    const difficulty = getDifficulty(quiz.level);

                                    return (
                                        <div key={quiz.id} className={styles.reviewItem}>
                                            <span className={styles.reviewIcon} aria-hidden="true">❓</span>
                                            <p className={styles.reviewText}>{quiz.prompt}</p>
                                            <span className={`${styles.difficulty} ${difficulty.tone}`}>{difficulty.label}</span>
                                            <Link href="/daily" className="button round small">Review</Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Link href="/daily" className={styles.startReviewButton}>
                            Start Daily Review ({DAILY_GOAL_MINUTES} min)
                        </Link>
                    </section>

                    <section id="badges" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Badges</h2>
                        </div>

                        <div className={styles.badgeGrid}>
                            {badges.map((badge) => (
                                <div key={badge.id} className={`${styles.badge} ${badge.achieved ? styles.badgeAchieved : ""}`}>
                                    <span aria-hidden="true">{badge.icon}</span>
                                    <p>{badge.label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <p className={styles.quote}>"Small steps every day lead to big changes." — Keep going! 🚀</p>
                </main>
            </div>

            <aside className={styles.rightRail}>
                <div className={styles.railCard}>
                    <h3>Streak Calendar</h3>
                    <div className={styles.calendarGrid}>
                        {calendar.map((day) => (
                            <div key={day.date} className={styles.calendarCell}>
                                <small>{day.label}</small>
                                <span
                                    className={`${styles.calendarDot} ${day.completed ? styles.calendarDotDone : ""} ${day.isToday ? styles.calendarDotToday : ""}`}
                                >
                                    {day.completed ? "✓" : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.railCard}>
                    <h3>XP Progress</h3>
                    <div className={styles.xpLevels}>
                        <span>Level {xp.level}</span>
                        <span>Level {xp.level + 1}</span>
                    </div>
                    <div className={styles.progressTrack}>
                        <span style={{ width: `${xp.xpIntoLevel}%` }} />
                    </div>
                    <p>{xp.xpIntoLevel} / {xp.xpForNextLevel} XP</p>
                </div>

                <div id="leaderboard" className={`${styles.railCard} ${styles.leaderboardCard}`}>
                    <div className={styles.sectionHeader}>
                        <h3>Leaderboard</h3>
                        <span className={styles.sectionMeta}>This Week</span>
                    </div>

                    {leaderboard.length === 0 ? (
                        <p className={styles.emptyNote}>Complete quizzes to join the leaderboard!</p>
                    ) : (
                        <ol className={styles.leaderboardList}>
                            {leaderboard.map((entry) => (
                                <li key={entry.id} className={entry.id === user.id ? styles.leaderboardMe : ""}>
                                    <span className={styles.leaderboardRank}>{entry.rank}</span>
                                    <span className={styles.leaderboardName}>
                                        {entry.displayName || entry.username}
                                        {entry.id === user.id ? " (You)" : ""}
                                    </span>
                                    <span className={styles.leaderboardXp}>{entry.xp} XP</span>
                                </li>
                            ))}
                        </ol>
                    )}

                    {!isInLeaderboard && (
                        <p className={styles.emptyNote}>Keep going to climb onto the leaderboard!</p>
                    )}
                </div>

                <Link href="/create" className={styles.railPromo}>
                    <h4>Create your own course</h4>
                    <p>Turn your notes into a full learning path for others to follow.</p>
                    <span className={styles.promoCta}>Start creating →</span>
                </Link>
            </aside>
        </div>
    );
}
