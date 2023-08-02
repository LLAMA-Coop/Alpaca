import { SourceDisplay, SourceInput } from "@/app/components/";
import Source from "@/app/api/models/Source";
import styles from "@/app/Page.module.css";

const sources = await Source.find();

export default function SourcesPage() {
  return (
    <main className={styles.main}>
      <h2>Sources</h2>

      {sources.length > 0 && (
        <section>
          <h3>Your sources</h3>

          <ol className={styles.listGrid}>
            {sources.map((src) => (
              <li key={src._id}>
                <SourceDisplay source={src} />
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h3>Create new source</h3>

        <SourceInput
          availableSources={sources.map((src) => {
            const { title, url, _id } = src;
            return { title, url, _id: _id.toString() };
          })}
        />
      </section>
    </main>
  );
}
