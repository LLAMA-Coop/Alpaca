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


      <SourceDisplay sources={sources} />

      {/* Add the title to the SourceInput component so it stays in the same container */}
      <SourceInput />

      {/* Same as above */}
      <UserInput isRegistering={true} />

      {/* Still same as above */}
      <NoteInput
        availableSources={sources.map((src) => {
          let { title, url, _id } = src;
          return { title, url, _id: _id.toString() };
        })}
      />
    </main>
  );
}
