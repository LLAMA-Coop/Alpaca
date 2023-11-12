import { NoteDisplay, SourceDisplay, QuizDisplay } from "@components/server";
import { SourceInput, NoteInput, QuizInput, Card } from "@components/client";
import { serialize, serializeOne } from "@/lib/db";
import styles from "./page.module.css";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
// import Source from "@models/Source";
// import Note from "@models/Note";
// import { Source, Note } from "@mneme_app/database-models";
import { Source, Note, Quiz } from "@/app/api/models";
import Link from "next/link";

export default async function Home({ searchParams }) {
    const user = serializeOne(
        await useUser({ token: cookies().get("token")?.value }),
    );
    const quizSample = serialize(
        await Quiz.aggregate([{ $sample: { size: 1 } }]),
    )[0];

    return (
        <main className={styles.main}>
            <h2>Welcome to Mneme!</h2>

            <section id="overall" className="paragraph">
                <h3>Overall Concept</h3>

                <p>
                    This app is intended for people who want to organize and
                    reinforce in their memory information that they want to
                    learn. Here's how you would use Mneme:
                </p>

                <ol>
                    <li>
                        First, you need to register and sign in. This is a
                        pretty standard process, and it gives you privileges to
                        create and edit. You will also be allowed to share with
                        other users, organize users into groups, and give other
                        users or groups privileges to read or edit what you have
                        created. You can use the{" "}
                        <Link href="/login">Login</Link> link in the menu above.
                    </li>

                    <li>
                        If you are working with an empty database, you first
                        need to input a Source. A Source is the resources that
                        you draw from to learn whatever it is you want to learn.
                        It can be anything: Lecture, book, article from a
                        periodical, interview, video, anything. The only
                        question you should ask is whether or not it qualifies
                        as a reliable source for your purposes. For example, say
                        you are testing on the life of a public figure. That
                        public figure's opinion is relevant and their quotes
                        from recorded interviews are reliable for that purpose.
                        But say you are instead researching for a science test.
                        A public figure would <em>not</em> be a reliable source.
                        You would want to instead cite scientific evidence.
                    </li>

                    <li>
                        Make notes from your sources. Notes are exactly what
                        they sound like. They are a summary or response to what
                        you are getting from the source. They can be short
                        quotes you want to highlight, a summary of long and
                        complex information, questions to later answer,
                        observations, comments, etc. In Mneme, Notes are very
                        simple, the simplest part of the app. You are required
                        to point the Note to at least one Source. If more than
                        one Source confirms your Note, it means your note has
                        more sources to back up its claim.
                    </li>

                    <li>
                        For information you want to reinforce over time, create
                        one or more <a href="#quiz">Quiz</a> questions. The Quiz
                        question is meant to challenge a user, either its
                        creator or people to whom the creator has shared the
                        Quiz. It presents a prompt of some type and provides one
                        or more inputs for the user to enter their response.
                        This can come in a few different forms:
                        <ul>
                            <li>Prompt/Response, similar to flashcards</li>

                            <li>Multiple Choice</li>

                            <li>
                                Ordered List Answers, when the response to a
                                question is in a list and order matters
                            </li>

                            <li>
                                Unordered List Answers, when order does not
                                matter
                            </li>

                            <li>Fill-in-the-Blank</li>
                        </ul>
                        But you are required to point the Quiz to at least one
                        thing from which its information is drawn, either a Note
                        or a Source. You can, of course, use more than one Note
                        and/or Source, and the more a Quiz has, the more there
                        is to back up whatever the Quiz is claiming, including
                        what is considered a correct response to its prompt.
                    </li>

                    <li>
                        Now Mneme is ready to use for studying or organizing
                        information. You can use it any way you like. Say you
                        are listening to a few interviews from someone, and you
                        want to assess and respond to how they think. You can
                        create a Source for each of their interviews, articles,
                        and blog posts. And you can make Notes for what they
                        express in those sources. If you, for some reason, need
                        to memorize what they say, you can create Quizzes for
                        you to use on a regular basis to challenge your memory.
                    </li>
                </ol>
            </section>

            <section id="quiz" className="paragraph">
                <h3>Quiz Questions</h3>

                <p>
                    Your main draw to Mneme may be its Quiz questions. You can
                    use those to put together quizzes that you can share.
                </p>

                <p>
                    There are, so far, five different types of quiz questions to
                    choose from:
                </p>

                <ul>
                    <li>Prompt/Response, similar to flashcards</li>
                    <li>Multiple Choice</li>
                    <li>
                        Ordered List Answers, when the response to a question is
                        in a list and order matters
                    </li>
                    <li>Unordered List Answers, when order does not matter</li>
                    <li>Fill-in-the-Blank</li>
                </ul>

                <p>Here is an example of a quiz question:</p>

                <QuizDisplay quiz={quizSample} canClientCheck={true} />

                <p>
                    If you can edit it, you can see a few things about how it's
                    put together:
                </p>

                <div
                    style={{
                        border: "1px solid var(--background-tertiary)",
                        padding: "1rem",
                        margin: "40px 0",
                    }}
                >
                    <QuizInput quiz={quizSample} />
                </div>

                <p>
                    Notice the "Type" select. Try out the various types that a
                    quiz question can be. Notice how the editor changes when the
                    type changes. This means that what each part of the editor
                    means changes when the type changes. For "Prompt/Response"
                    type, the "Answers" list is a list of valid answers to the
                    one response a user can give.
                </p>

                <p>
                    When on type "Multiple Choice," you are also permitted to
                    add a list of "choices," which are choices a user will be
                    given to select from to answer the question. The "answers"
                    list are all the choices that will be accepted as correct
                    (and you can make more than one choice correct).
                </p>

                <p>
                    A Quiz question must have either a related Source or a Note.
                    This is the Note or Source from which the Quiz gets its
                    correct answer. You can have multiple sources and/or notes
                    for each Quiz question.
                </p>

                <p>
                    If you are creating a new Quiz question without a Note or
                    Source, you have the option to create a new Source or a Note
                    that you may later have the Quiz point to with "related
                    sources" or "related notes". Clicking "Create New Source" or
                    "Create New Note" opens a modal with the same form that you
                    would use to create a new Note or Source. Try both buttons
                    to get a sneak peek at what you will need to create a Source
                    and Note.
                </p>
            </section>
        </main>
    );
}
