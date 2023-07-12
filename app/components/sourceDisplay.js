import Link from "next/link";
import styles from "./sourceDisplay.module.css";

export default function SourceDisplay({ source }) {
  return (
    <div className={styles.source}>
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
      <Link href={source.url}>Click here to visit source page</Link>
    </div>
  );
}
