import Link from "next/link";
import styles from "./sourceDisplay.module.css";

export default function SourceDisplay({ sources }) {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h3>Sources</h3>

        <div className={styles.sourceGrid}>
          {sources.map((source) => (
            <div className={styles.source} key={source._id}>
              <h4>{source.title}</h4>
              <p>
                <em>Medium: </em>
                {source.medium}
              </p>
              <div className={styles.contributors}>
                <p>Contributors:</p>
                {source.contributors.length > 0 ? (
                  <ol>
                    {source.contributors.map((cont) => {
                      return <li key={cont}>{cont}</li>;
                    })}
                  </ol>
                ) : (
                  <p>No contributors listed</p>
                )}
              </div>

              <Link href={source.url} target="_blank">Click here to visit source page</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
