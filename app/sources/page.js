import Source from "../api/models/Source";
import SourceDisplay from "../components/source/sourceDisplay";
import SourceInput from "../components/source/sourceInput";
import styles from "../page.module.css";

const sources = await Source.find();

export default function SourcesPage() {
  return (
    <main className={styles.main}>
      <h2>Sources</h2>

      <section>
        <div className='centeredContainer'>
          <h3>Sources</h3>

          <div className={styles.sourceGrid}>
            {sources.map((src) => <SourceDisplay key={src._id} source={src} />)}
          </div>
        </div>
      </section>

      <section>
        <SourceInput
          availableSources={sources.map((src) => {
            let { title, url, _id } = src;
            return { title, url, _id: _id.toString() };
          })}
        />
      </section>
    </main>
  );
}
