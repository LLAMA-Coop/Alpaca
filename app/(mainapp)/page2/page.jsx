import styles from "./Landing.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Link from "next/link";
import { getPermittedResources } from "@/lib/db/helpers";

export default async function LandingPage() {
    const user = await useUser({ token: (await cookies()).get("token")?.value });

    // const note = (await getNotesById({ id: 1 }))[0];

    const { quizzes } = await getPermittedResources({
        userId: user.id,
        withQuizzes: true,
    });

    return (
        <main className={styles.container}>
            <span className={styles.orb} />
            <span className={styles.orb} />
            <span className={styles.orb} />
            <span className={styles.orb} />
            <span className={styles.orb} />

            <section className={styles.hero}>
                <img src="/assets/landing/llama.png" alt="Drawing of a llama" />

                <h1>Welcome To Alpaca!</h1>
                <p>Create | Test | Learn</p>

                <Link className="button primary round" href="#grid">
                    Discover plans
                </Link>

                <img src="/assets/landing/stars.png" alt="Stars illustration" />
                <img src="/assets/landing/stars.png" alt="Stars illustration" />
                <img src="/assets/landing/inter.png" alt="Constellation" />
                <img src="/assets/landing/inter2.png" alt="Constellation" />
            </section>

            <section className={styles.section}>
                <article>
                    <img
                        src="/assets/landing/discordImg.png"
                        alt="Image of a discord server"
                    />

                    <div className={styles.articleText}>
                        <h2>
                            Smart&nbsp;
                            <span>Note-Taking&nbsp;</span>
                            System
                        </h2>

                        <p>
                            Streamline your study routine with our intuitive
                            note-taking tool, ensuring efficient organization
                            and easy revision.
                        </p>
                    </div>
                </article>

                <article>
                    <img
                        src="/assets/landing/discordImg.png"
                        alt="Image of a discord server"
                    />

                    <div className={styles.articleText}>
                        <h2>
                            Interactive&nbsp;
                            <span>Assessments</span>
                        </h2>

                        <p>
                            Boost your learning journey with engaging quizzes
                            and tests, tailored to your goals for effective
                            self-assessment.
                        </p>
                    </div>
                </article>

                <article>
                    <img
                        src="/assets/landing/discordImg.png"
                        alt="Image of a discord server"
                    />

                    <div className={styles.articleText}>
                        <h2>
                            <span>Explore&nbsp;</span>
                            and Enrich
                        </h2>

                        <p>
                            Dive into a world of knowledge through our curated
                            marketplace, offering diverse courses crafted by
                            experts to elevate your skills.
                        </p>
                    </div>
                </article>
            </section>

            <section className={styles.grid} id="grid">
                <h3>Alpaca - The New Way Of Learning</h3>

                <div>
                    <div>
                        <p>Flashcards</p>
                    </div>

                    <div>
                        <p>Group Tests</p>
                    </div>

                    <div className={styles.freePlan}>
                        <h4>Free Plan</h4>

                        <ul>
                            <li>Note Taker</li>
                            <li>Auto generated</li>
                            <li>Flashcards</li>
                            <li>Group Tests</li>
                            <li>Daily Train</li>
                        </ul>

                        <Link href="/pricing">More plans</Link>
                    </div>

                    <div className={styles.newsletter}>
                        <h4>Subscribe to our newsletter</h4>
                        <input type="email" placeholder="Your email address" />
                        <button disabled>Submit</button>
                    </div>

                    <div className={styles.carousel}>
                        <p>React course</p>
                    </div>
                </div>
            </section>

            {/* <section className={styles.section}>
                {notes.map((x) => (
                    <p key={x.id}>
                        {x.id} {x.title}; {x.text}; {x.creator.username};{" "}
                        {x.permissionType}
                    </p>
                ))}
                <p>{note.id}</p>

                {quizzes.map((q) => (
                    <QuizDisplay key={q.id} quiz={q} />
                ))}
            </section> */}
        </main>
    );
}
