import styles from "./page.module.css";
import Source from "./api/models/Source";
import SourceDisplay from "./components/source/sourceDisplay";
import SourceInput from "./components/source/sourceInput";
import UserInput from "./components/user/userInput";
import NoteInput from "./components/note/noteInput";

const sources = await Source.find();

export default function Home() {
  return (
    <main className={styles.main}>
      <h2>Let's take it for a spin!</h2>
      <h3>Sources</h3>
      {sources.map((src) => {
        return <SourceDisplay key={src._id} source={src}></SourceDisplay>;
      })}

      <p>Add Source</p>
      <SourceInput></SourceInput>

      <p>Register new user</p>
      <UserInput isRegistering={true}></UserInput>

      <p>Adding a note</p>
      <NoteInput
        availableSources={sources.map((src) => {
          let { title, url, _id } = src;
          return { title, url, _id };
        })}
      ></NoteInput>
    </main>
  );
}
