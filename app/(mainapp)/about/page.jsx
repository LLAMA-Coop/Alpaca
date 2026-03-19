import styles from "@/app/(mainapp)/page.module.css";
import Link from "next/link";

export default function About() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>About Alpaca</h1>
                <p className={styles.heroSubtitle}>
                    A comprehensive learning platform designed to transform how you study and retain information
                </p>
            </section>

            <section className={styles.aboutSection}>
                <div className={styles.aboutContent}>
                    <h2>Our Vision</h2>
                    <p>
                        There are plenty of flashcard apps available, and plenty that make adding flashcards easy.
                        But wouldn't it be great if you could do something more complex than flashcards? How about
                        fill-in-the-blank? How about answering with a list that doesn't care about the order of the
                        items, so long as all items are there? Maybe you want to memorize text verbatim, to memorize
                        a line, for example?
                    </p>
                    <p>
                        Most importantly, all of these forms of quiz questions should each be linked to at least one
                        reliable source, so if something in the question or answer doesn't seem right, you can check
                        and correct it. This is the vision behind Alpaca.
                    </p>
                </div>
            </section>

            <section className={styles.featuresAbout}>
                <h2>Why Choose Alpaca?</h2>
                <div className={styles.whyGrid}>
                    <div className={styles.whyCard}>
                        <h3>Source-Backed Learning</h3>
                        <p>
                            Every quiz connects to its sources, so you can verify and review the original material
                            whenever you need to. Build confidence in your knowledge through proper citation.
                        </p>
                    </div>
                    <div className={styles.whyCard}>
                        <h3>Flexible Question Types</h3>
                        <p>
                            Go beyond flashcards with multiple question types: Multiple Choice, Fill-in-the-Blank,
                            Ordered Lists, Unordered Lists, and Prompt/Response. Learn the way that works for you.
                        </p>
                    </div>
                    <div className={styles.whyCard}>
                        <h3>Smart Note Taking</h3>
                        <p>
                            Create concise notes that condense complex information from your sources. Link notes to
                            sources and create quiz questions that reference both for comprehensive learning.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.aboutSection}>
                <div className={styles.aboutContent}>
                    <h2>The Mission</h2>
                    <p>
                        Alpaca is not just for taking quizzes. It's for making them easily for yourself or anyone else.
                        It's a web application and API for submitting, storing, and retrieving learning materials in a
                        database.
                    </p>
                    <p>
                        These learning materials include:
                    </p>
                    <ul className={styles.missionList}>
                        <li><strong>Sources</strong> - Articles, research papers, official documents, videos, lectures, and any reliable information source</li>
                        <li><strong>Notes</strong> - Condensed summaries that clarify and organize information from sources</li>
                        <li><strong>Quizzes</strong> - Questions and prompts to challenge your understanding and reinforce learning</li>
                    </ul>
                </div>
            </section>

            <section className={styles.communitySection}>
                <h2>Open Source & Community-Driven</h2>
                <p>
                    Alpaca is open source, and we welcome contributors from around the world.
                </p>
                <div className={styles.communityLinks}>
                    <a href="https://github.com/joewrotehaikus/mnemefeast" target="_blank" rel="noopener noreferrer" className={styles.communityCard}>
                        <h3>GitHub Repository</h3>
                        <p>View the source code, create forks, and submit pull requests to help improve Alpaca</p>
                    </a>
                    <a href="https://discord.com/channels/1122590467633184920/1122590468400746590" target="_blank" rel="noopener noreferrer" className={styles.communityCard}>
                        <h3>Discord Server</h3>
                        <p>Join our community for discussions, questions, and collaboration with other users</p>
                    </a>
                    <div className={styles.communityCard}>
                        <h3>Get Involved</h3>
                        <p>Whether you're a developer, designer, or educator, there's a way for you to contribute and make Alpaca better</p>
                    </div>
                </div>
            </section>

            <section className={styles.techSection}>
                <h2>Built With Modern Technology</h2>
                <p>
                    Alpaca is built on a solid foundation of proven technologies:
                </p>
                <ul className={styles.techList}>
                    <li><strong>Next.js 13+</strong> - Modern React framework for high-performance web applications</li>
                    <li><strong>Mongoose</strong> - Elegant MongoDB object modeling for reliable data management</li>
                    <li><strong>Responsive Design</strong> - Beautiful experience on desktop, tablet, and mobile devices</li>
                </ul>
            </section>

            <section className={styles.getStartedSection}>
                <h2>Ready to Start Learning Better?</h2>
                <p>Join the community of learners making education more effective</p>
                <div className={styles.heroCTA}>
                    <Link href="/register" className={styles.buttonPrimary}>
                        <span className={styles.buttonText}>Create Account</span>
                        <span className={styles.buttonIcon}>→</span>
                    </Link>
                    <Link href="/" className={styles.buttonSecondary}>
                        <span className={styles.buttonText}>Back to Home</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}
