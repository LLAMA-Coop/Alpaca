import { ListItem, Card } from "@/app/components/client";
import styles from "./SourceDisplay.module.css";

export function SourceDisplay({ source }) {
  return (
    <Card
      title={source.title}
      description={source.medium}
      buttons={[
        {
          label: "Visit the source page",
          link: source.url,
        },
      ]}
    >
      <div className={styles.contributors}>
        <h5>Contributors</h5>
        {source.contributors.length > 0 ? (
          <ol className="chipList">
            {source.contributors.map((cont) => (
              <ListItem
                key={cont}
                item={/^http/.test(cont) ? "See all of the contributors" : cont}
                link={/^http/.test(cont) ? cont : null}
              />
            ))}
          </ol>
        ) : (
          <p>No contributors listed</p>
        )}
      </div>
    </Card>
  );
}
