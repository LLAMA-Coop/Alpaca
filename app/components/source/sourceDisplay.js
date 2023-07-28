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
        <h5>Contributors</h5>
        {source.contributors.length > 0 ? (
          <ol className="chipGrid">
            {source.contributors.map((cont, index) => {
              let contDisp = cont;
              if(/^http/.test(cont)){
                contDisp = <Link href={cont}>{cont}</Link>
              }
              return <li key={cont + index.toString()}>{contDisp}</li>;
            })}
          </ol>
        ) : (
          <p>No contributors listed</p>
        )}
      </div>

      <Link href={source.url} target="_blank">
        Visit the source page
      </Link>
    </div>
  );
}
