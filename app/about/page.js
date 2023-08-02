import styles from "@/app/Page.module.css";

export default function About() {
  return (
    <main className={styles.main}>
      <h2>About Mneme</h2>

      <section>
        <div className={styles.description}>
          <p>
            There are plenty of flashcard apps available, and plenty that make
            adding flashcards easy. But wouldn't it be great if you could do
            something more complex than flashcards? How about fill-in-the-blank?
            How about answering with a list that doesn't care about the order of
            the items, so long as all items are there? Maybe you want to
            memorize text verbatim, to memorize a line, for example?
          </p>

          <p>
            But more importantly, all of these forms of quiz questions should
            each be linked to at least one reliable source, so if something in
            the question or answer doesn't seem right, you can check and correct
            it.
          </p>

          <p>
            This, along with short notes to condense information from sources,
            is the vision behind Mneme. It is not just for taking quizzes. It's
            for making them easily for yourself or anyone else.
          </p>

          <p>
            Named for the{" "}
            <a href="https://en.wikipedia.org/wiki/Mneme" target="_blank">
              Greek Muse for memory
            </a>
            , Mneme will be a web application and API for submitting, storing,
            and retrieving learning materials in a database. These learning
            materials can be sources of information, such as articles, news
            reports, official documents, scientific papers, specifications, etc;
            notes to condense and clarify the information in those sources; and
            questions or prompts to challenge a student to recall and use the
            information.
          </p>

          <p>
            This project is open source. Contributors are welcome to{" "}
            <a
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
            <a href="https://discord.gg/PcsjqPFh" target="_blank">
              go to our Discord server
            </a>
            .
          </p>

          <p>This application is using NextJs 13 and Mongoose.</p>
        </div>
      </section>
    </main>
  );
}
