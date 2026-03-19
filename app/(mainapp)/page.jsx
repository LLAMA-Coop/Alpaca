import { QuizInput, QuizDisplay, QuizTest } from "@client";
import styles from "./page.module.css";
import Link from "next/link";
import { AlpacaSVG } from "@/app/components/AlpacaSVG";
import { AvailableCourses } from "@/app/components/Course/AvailableCourses";

export default async function HomePage() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.heroContainer}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>Master Your Learning</h1>
                        <p className={styles.heroSubtitle}>
                            Create a craft of skills. Organize sources, create notes, and reinforce knowledge through intelligent quizzes.
                        </p>
                        <div className={styles.heroCTA}>
                            <Link href="/login" className={styles.buttonPrimary}>
                                <span className={styles.buttonText}>Get Started</span>
                                <span className={styles.buttonIcon}>→</span>
                            </Link>
                            <Link href="/about" className={styles.buttonSecondary}>
                                <span className={styles.buttonText}>Learn More</span>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroImage}>
                        <AlpacaSVG />
                    </div>
                </div>
            </section>

            <AvailableCourses />

            <section className={styles.features}>
                <h2>How Alpaca Works</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureNumber}>1</div>
                        <h3>Add Sources</h3>
                        <p>Start by adding reliable sources like books, articles, lectures, or videos</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureNumber}>2</div>
                        <h3>Create Notes</h3>
                        <p>Summarize and clarify information from your sources into concise notes</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureNumber}>3</div>
                        <h3>Build Quizzes</h3>
                        <p>Create multiple quiz formats to test your understanding and retention</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureNumber}>4</div>
                        <h3>Study Daily</h3>
                        <p>Use spaced repetition to reinforce learning and improve long-term memory</p>
                    </div>
                </div>
            </section>

            <section className={styles.quizSection}>
                <h2>Flexible Quiz Formats</h2>
                <p className={styles.sectionDescription}>
                    Choose from multiple question types to match your learning style
                </p>
                <div className={styles.quizGrid}>
                    <div className={styles.quizCard}>
                        <h4>Flashcards</h4>
                        <p>Prompt and response format for simple recall</p>
                    </div>
                    <div className={styles.quizCard}>
                        <h4>Multiple Choice</h4>
                        <p>Select the correct answer from provided options</p>
                    </div>
                    <div className={styles.quizCard}>
                        <h4>Ordered Lists</h4>
                        <p>Answer with a list where order matters</p>
                    </div>
                    <div className={styles.quizCard}>
                        <h4>Unordered Lists</h4>
                        <p>Answer with items in any order</p>
                    </div>
                    <div className={styles.quizCard}>
                        <h4>Fill-in-the-Blank</h4>
                        <p>Complete sentences with precise wording</p>
                    </div>
                </div>
            </section>

            <section className={styles.whySection}>
                <h2>Why Alpaca?</h2>
                <div className={styles.whyGrid}>
                    <div className={styles.whyCard}>
                        <h3>Source-Backed Learning</h3>
                        <p>Every quiz connects to its sources, so you can verify and review the original material</p>
                    </div>
                    <div className={styles.whyCard}>
                        <h3>Comprehensive System</h3>
                        <p>Go beyond flashcards with multiple question types designed for real learning</p>
                    </div>
                    <div className={styles.whyCard}>
                        <h3>Open Source</h3>
                        <p>Community-driven development with transparent code on GitHub</p>
                    </div>
                </div>
            </section>

            <section className={styles.getStartedSection}>
                <h2>Ready to Transform Your Learning?</h2>
                <p>Join thousands of students and lifelong learners using Alpaca</p>
                <div className={styles.heroCTA}>
                    <Link href="/register" className={styles.buttonPrimary}>
                        <span className={styles.buttonText}>Sign Up Now</span>
                        <span className={styles.buttonIcon}>→</span>
                    </Link>
                    <Link href="/about" className={styles.buttonSecondary}>
                        <span className={styles.buttonText}>Explore Features</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}
