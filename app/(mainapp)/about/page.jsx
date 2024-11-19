import styles from "@/app/(mainapp)/page.module.css";

export default function About() {
    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>About Alpaca</h2>
            </div>

            <section className="paragraph">
                <p>
                    There are plenty of flashcard apps available, and plenty
                    that make adding flashcards easy. But wouldn't it be great
                    if you could do something more complex than flashcards? How
                    about fill-in-the-blank? How about answering with a list
                    that doesn't care about the order of the items, so long as
                    all items are there? Maybe you want to memorize text
                    verbatim, to memorize a line, for example?
                </p>

                <p>
                    But more importantly, all of these forms of quiz questions
                    should each be linked to at least one reliable source, so if
                    something in the question or answer doesn't seem right, you
                    can check and correct it.
                </p>

                <p>
                    This, along with short notes to condense information from
                    sources, is the vision behind Alpaca. It is not just for
                    taking quizzes. It's for making them easily for yourself or
                    anyone else.
                </p>

                <p>
                    Named for the{" "}
                    <a
                        className="link"
                        href="https://en.wikipedia.org/wiki/Alpaca"
                        target="_blank"
                    >
                        Greek Muse for memory
                    </a>
                    , Alpaca will be a web application and API for submitting,
                    storing, and retrieving learning materials in a database.
                    These learning materials can be sources of information, such
                    as articles, news reports, official documents, scientific
                    papers, specifications, etc; notes to condense and clarify
                    the information in those sources; and questions or prompts
                    to challenge a student to recall and use the information.
                </p>

                <p>
                    This project is open source. Contributors are welcome to{" "}
                    <a
                        className="link"
                        href="https://github.com/joewrotehaikus/mnemefeast"
                        target="_blank"
                    >
                        view the source code on GitHub
                    </a>
                    , make their own GitHub fork, and submit pull requests for
                    contribution to the project.
                </p>

                <p>
                    For discussion about the application,{" "}
                    <a
                        className="link"
                        href="https://discord.com/channels/1122590467633184920/1122590468400746590"
                        target="_blank"
                    >
                        go to our Discord server
                    </a>
                    .
                </p>

                <p>This application is using NextJs 13 and Mongoose.</p>
            </section>
        </main>
    );
}
