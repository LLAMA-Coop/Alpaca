import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Mneme Feast</h1>
      <p>
        Named for the{" "}
        <a href="https://en.wikipedia.org/wiki/Mneme" target="_blank">
          Greek Muse for memory
        </a>
        , Mneme Feast will be a web application and API for submitting, storing,
        and retrieving learning materials in a database. These learning
        materials can be sources of information, such as articles, news reports,
        official documents, scientific papers, specifications, etc; notes to
        condense and clarify the information in those sources; and questions or
        prompts to challenge a student to recall and use the information.
      </p>
      <p>
        This project is open source. Contributors are welcome to{" "}
        <a href="https://github.com/joewrotehaikus/mnemefeast">
          view the source code on GitHub
        </a>
        , make their own GitHub fork, and submit pull requests for contribution
        to the project.
      </p>
      <p>
        For discussion about the application,{" "}
        <a href="https://discord.gg/PcsjqPFh">go to our Discord server</a>.
      </p>
      <p>This application is using NextJS 13 and Mongoose.</p>
    </main>
  );
}
