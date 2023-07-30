import Link from "next/link";
import styles from "./sourceDisplay.module.css";
import { ListItem } from "../form/Form";

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
            {source.contributors.map((cont, index) => (
              <ListItem
                key={cont}
                item={cont}
                link={/^http/.test(cont) ? cont : null}
              />
            ))}
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
