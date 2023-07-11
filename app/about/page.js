import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

export default function About() {
  return (
    <main className={styles.main}>
      <h1>About Mneme Feast</h1>
      <p>
        Named for the{" "}
        <Link href="https://en.wikipedia.org/wiki/Mneme" target="_blank">
          Greek Muse for memory
        </Link>
        , Mneme Feast will be a web application and API for submitting, storing,
        and retrieving learning materials in a database. These learning
        materials can be sources of information, such as articles, news reports,
        official documents, scientific papers, specifications, etc; notes to
        condense and clarify the information in those sources; and questions or
        prompts to challenge a student to recall and use the information.
      </p>
      <p>
        This project is open source. Contributors are welcome to{" "}
        <Link href="https://github.com/joewrotehaikus/mnemefeast">
          view the source code on GitHub
        </Link>
        , make their own GitHub fork, and submit pull requests for contribution
        to the project.
      </p>
      <p>
        For discussion about the application,{" "}
        <Link href="https://discord.gg/PcsjqPFh">go to our Discord server</Link>.
      </p>
      <p>This application is using NextJS 13 and Mongoose.</p>
    </main>
  );
}
