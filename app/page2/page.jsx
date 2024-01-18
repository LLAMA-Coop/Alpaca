"use client";
import styles from "./home.module.css";
import { useRef } from "react";
import Image from "next/image";
import llama from "../../public/assets/landing/llama.png"

function page() {
    // Creating a ref for the target element
    const myTargetRef = useRef(null);

    // Event handler for click
    const scrollToTarget = () => {
        if (myTargetRef.current) {
            window.scrollTo({
                top: myTargetRef.current.offsetTop,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <span className={styles.orb1}></span>
                <span className={styles.orb2}></span>
                <span className="star">
                    <img
                        src="/assets/landing/stars.png"
                        alt="drawing of stars"
                    />
                </span>
                <span className="inter">
                    <img src="/assets/landing/inter.png" alt="Constellation Orion" />
                </span>

                <div className={styles.hero}>
                    <Image
                        src={llama}
                        alt="Drawing of a llama angel"
                        className={styles.llamaImg}
                    />

                    <div className={styles.welcomeText}>Welcome To Mneme!</div>
                    <div className={styles.subText}>Create | Test | Learn</div>
                    <a
                        onClick={scrollToTarget}
                        className={`${styles.discoverBtn} ${styles.hover}`}
                        style={{ color: "#0f172a" }}
                    >
                        DISCOVER PLANS
                    </a>
                </div>

                <span className="inter2">
                    <img src="assets/landing/inter2.png" alt="Constellation Ursa Major" />
                </span>
                <span className="star2">
                    <img
                        src="assets/landing/stars.png"
                        alt="drawing of stars"
                    />
                </span>

                <section className={styles.info}>
                    <article className={`${styles.one} ${styles.article}`}>
                        <div className={styles.text}>
                            <div className={styles.title}>
                                Smart&nbsp;
                                <span className={styles.accent}>
                                    Note-Taking
                                    <br />
                                </span>
                                System
                            </div>
                            <p>
                                Streamline your study routine with our intuitive
                                note-taking tool, ensuring efficient
                                organization and easy revision.
                            </p>
                        </div>
                        <img
                            className={styles.llamaImg}
                            src="./assets/landing/discordImg.png"
                            alt="image of a discord server"
                        />
                    </article>
                    <article className={`${styles.two} ${styles.article}`}>
                        <div className={styles.text}>
                            <div className={styles.title}>
                                Interactive
                                <br />
                                <span className={styles.accent}>
                                    Assessments
                                </span>
                            </div>
                            <p>
                                Boost your learning journey with engaging
                                quizzes and tests, tailored to your goals for
                                effective self-assessment.
                            </p>
                        </div>
                        <img
                            src="./assets/landing/discordImg.png"
                            alt="image of a discord server"
                        />
                    </article>
                    <article className={`${styles.three} ${styles.article}`}>
                        <div className={styles.text}>
                            <div className={styles.title}>
                                <span className={styles.accent}>
                                    Explore&nbsp;
                                </span>
                                and Enrich
                            </div>
                            <p>
                                Dive into a world of knowledge through our
                                curated marketplace, offering diverse courses
                                crafted by experts to elevate your skills.
                            </p>
                        </div>
                        <img
                            src="./assets/landing/discordImg.png"
                            alt="image of a discord server"
                        />
                    </article>
                </section>

                <section ref={myTargetRef} className={styles.grid}>
                    <div className={styles.gridTitle}>
                        Mneme - The New Way Of Learning
                    </div>
                    <div className={styles.gridContainer}>
                        <div
                            className={`${styles.gridItem} ${styles.carousel}`}
                        >
                            React course
                        </div>
                        <div className={styles.bloc}>
                            <div className={styles.middleSection}>
                                <div className={styles.twoBlocs}>
                                    <div
                                        className={`${styles.gridItem} ${styles.flashcards}`}
                                    >
                                        <div className={styles.content}>
                                            Flashcards
                                        </div>
                                    </div>
                                    <div
                                        className={`${styles.gridItem} ${styles.group}`}
                                    >
                                        <div className={styles.content}>
                                            Group Tests
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={`${styles.gridItem} ${styles.freePlan}`}
                                >
                                    <div className={styles.title}>
                                        Free Plan
                                    </div>
                                    <div className={styles.content}>
                                        <ul>
                                            <li>Note Taker</li>
                                            <li>Auto generated</li>
                                            <li>Flashcards</li>
                                            <li>Group Tests</li>
                                            <li>Daily Train</li>
                                        </ul>
                                    </div>
                                    <a
                                        className={`${styles.morePlans} ${styles.hover}`}
                                        style={{ color: "#10b77f" }}
                                    >
                                        more plans
                                    </a>
                                </div>
                            </div>
                            <div
                                className={`${styles.gridItem} ${styles.newsletter}`}
                            >
                                <div className={styles.newsTitle}>
                                    Subscribe to our newsletter
                                </div>
                                <input
                                    className={styles.input}
                                    type="email"
                                    placeholder="Your email address"
                                />
                                <a
                                    className={styles.subscribeBtn}
                                    style={{ color: "#FFF" }}
                                >
                                    Submit
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className={styles.footer}>
                    <div className={styles.links}>
                        <article className={styles.partners}>
                            <div className={styles.content}>
                                <div className={styles.title}>Partners</div>
                                <ul>
                                    <li>Testimonials</li>
                                    <li>Affiliates</li>
                                    <li>Events</li>
                                    <li>Investors</li>
                                </ul>
                            </div>
                        </article>
                        <article className={styles.about}>
                            <div className={styles.content}>
                                <div className={styles.title}>About us</div>
                                <ul>
                                    <li>Courses</li>
                                    <li>Community</li>
                                    <li>Contact</li>
                                    <li>Support</li>
                                </ul>
                            </div>
                        </article>
                        <article className={styles.community}>
                            <div className={styles.content}>
                                <div className={styles.title}>Community</div>
                                <ul>
                                    <li>Become a sponsor</li>
                                    <li>Donate</li>
                                    <li>Contribute to Courses</li>
                                    <li>Careers</li>
                                </ul>
                            </div>
                        </article>
                        <article className={styles.terms}>
                            <div className={styles.content}>
                                <div className={styles.title}>Terms</div>
                                <ul>
                                    <li>Privacy Policy</li>
                                    <li>Cookie Policy</li>
                                    <li>Terms and Conditions</li>
                                    <li>Help Center</li>
                                </ul>
                            </div>
                        </article>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default page;
