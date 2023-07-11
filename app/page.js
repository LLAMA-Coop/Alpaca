import styles from "./page.module.css";
import Source from "./api/models/Source";

const sources = await Source.find();

export default function Home() {
  return (
    <main className={styles.main}>
      <h2>Let's take it for a spin!</h2>
      <h3>Sources</h3>
      {sources.map((src) => {
        return (
          <div key={src._id}>
            <h4>{src.title}</h4>
            <p>
              <em>Medium: </em>
              {src.medium}
            </p>
            <p>
              <em>Contributors: </em>
            </p>
            {src.contributors.length > 0 ? (
              <ol>
                {src.contributors.map((cont) => {
                  return <li key={cont}>{cont}</li>;
                })}
              </ol>
            ) : (
              <p>No contributors listed</p>
            )}
            <a href={src.url}>Click here to visit source page</a>
          </div>
        );
      })}
    </main>
  );
}
