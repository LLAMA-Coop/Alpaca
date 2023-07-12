import styles from "./page.module.css";
import Source from "./api/models/Source";
import SourceDisplay from "./components/source/sourceDisplay";
import SourceInput from "./components/source/sourceInput";

const sources = await Source.find();

export default function Home() {
  return (
    <main className={styles.main}>
      <h2>Let's take it for a spin!</h2>
      <h3>Sources</h3>
      {sources.map((src) => {
        return (
          <SourceDisplay key={src._id} source={src}></SourceDisplay>
        );
      })}

      <p>Add Source</p>
      <SourceInput></SourceInput>
    </main>
  );
}
