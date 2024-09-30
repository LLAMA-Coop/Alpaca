import { QuizInput, QuizDisplay, QuizTest } from "@client";
import styles from "./page.module.css";
import Link from "next/link";

export default async function HomePage() {
    return (
        <main className={styles.main}>
            <header>
                <h1>Welcome to Alpaca!</h1>
            </header>

            <section
                id="overall"
                className="paragraph"
            >
                <h2>Overall Concept</h2>

                <p>
                    This app is intended for people who want to organize and reinforce in their
                    memory information that they want to learn. Here's how you would use Alpaca:
                </p>

                <ol className={styles.steps}>
                    <li>
                        <p>
                            First, you need to register and sign in. You can use the{" "}
                            <Link
                                className="link"
                                href="/login"
                            >
                                Login
                            </Link>{" "}
                            link in the menu above.
                        </p>
                    </li>

                    <li>
                        <p>
                            If you are working with an empty database, you first need to input a
                            Source. A Source is the resources that you draw from to learn whatever
                            it is you want to learn. It can be anything: Lecture, book, article from
                            a periodical, interview, video, anything. The only question you should
                            ask is whether or not it qualifies as a reliable source for your
                            purposes. For example, say you are testing on the life of a public
                            figure. That public figure's opinion is relevant and their quotes from
                            recorded interviews are reliable for that purpose. But say you are
                            instead researching for a science test. A public figure would{" "}
                            <em>not</em> be a reliable source. You would want to instead cite
                            scientific evidence.
                        </p>
                    </li>

                    <li>
                        Make notes from your sources. Notes are exactly what they sound like. They
                        are a summary or response to what you are getting from the source. They can
                        be short quotes you want to highlight, a summary of long and complex
                        information, questions to later answer, observations, comments, etc. In
                        Alpaca, Notes are very simple, the simplest part of the app. You are
                        required to point the Note to at least one Source. If more than one Source
                        confirms your Note, it means your note has more sources to back up its
                        claim.
                    </li>

                    <li>
                        <p>
                            For information you want to reinforce over time, create one or more{" "}
                            <a
                                href="#quiz"
                                className="link"
                            >
                                Quiz{" "}
                            </a>
                            questions. The Quiz question is meant to challenge a user, either its
                            creator or people to whom the creator has shared the Quiz. It presents a
                            prompt of some type and provides one or more inputs for the user to
                            enter their response. This can come in a few different forms:
                        </p>
                        <ul className={styles.quizTypes}>
                            <li>Prompt/Response, similar to flashcards</li>

                            <li>Multiple Choice</li>

                            <li>
                                Ordered List Answers, when the response to a question is in a list
                                and order matters
                            </li>

                            <li>Unordered List Answers, when order does not matter</li>

                            <li>Fill-in-the-Blank</li>
                        </ul>
                        But you are required to point the Quiz to at least one thing from which its
                        information is drawn, either a Note or a Source. You can, of course, use
                        more than one Note and/or Source, and the more a Quiz has, the more there is
                        to back up whatever the Quiz is claiming, including what is considered a
                        correct response to its prompt.
                    </li>

                    <li>
                        Now Alpaca is ready to use for studying or organizing information. You can
                        use it any way you like. Say you are listening to a few interviews from
                        someone, and you want to assess and respond to how they think. You can
                        create a Source for each of their interviews, articles, and blog posts. And
                        you can make Notes for what they express in those sources. If you, for some
                        reason, need to memorize what they say, you can create Quizzes for you to
                        use on a regular basis to challenge your memory.
                    </li>
                </ol>
            </section>

            <section id="quiz">
                <h2>Quiz Questions</h2>

                <p>
                    Your main draw to Alpaca may be its Quiz questions. You can use those to put
                    together quizzes that you can share.
                </p>

                <p>There are, so far, five different types of quiz questions to choose from:</p>

                <ul className={styles.quizTypes}>
                    <li>Prompt/Response, similar to flashcards</li>
                    <li>Multiple Choice</li>
                    <li>
                        Ordered List Answers, when the response to a question is in a list and order
                        matters
                    </li>
                    <li>Unordered List Answers, when order does not matter</li>
                    <li>Fill-in-the-Blank</li>
                </ul>

                <p>
                    Here is an example of a quiz question. You can edit it below to see how it
                    works.
                </p>

                <QuizTest />

                <p>
                    Notice the "Type" select. Try out the various types that a quiz question can be.
                    Notice how the editor changes when the type changes. This means that what each
                    part of the editor means changes when the type changes. For "Prompt/Response"
                    type, the "Answers" list is a list of valid answers to the one response a user
                    can give.
                </p>

                <p>
                    When on type "Multiple Choice," you are also permitted to add a list of
                    "choices," which are choices a user will be given to select from to answer the
                    question. The "answers" list are all the choices that will be accepted as
                    correct (and you can make more than one choice correct).
                </p>

                <p>
                    A Quiz question must have either a related Source or a Note. This is the Note or
                    Source from which the Quiz gets its correct answer. You can have multiple
                    sources and/or notes for each Quiz question.
                </p>

                <p>
                    If you are creating a new Quiz question without a Note or Source, you have the
                    option to create a new Source or a Note that you may later have the Quiz point
                    to with "related sources" or "related notes". Clicking "Create New Source" or
                    "Create New Note" opens a modal with the same form that you would use to create
                    a new Note or Source. Try both buttons to get a sneak peek at what you will need
                    to create a Source and Note.
                </p>
            </section>
        </main>
    );
}
