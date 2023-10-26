import { ListItem, Card } from "@components/client";
import styles from "./SourceDisplay.module.css";

export function SourceDisplay({ source }) {
    return (
        <Card
            title={source.title}
            subtitle={source.medium}
            buttons={[
                {
                    label: "Visit the source page",
                    link: source.url,
                },
            ]}
        >
            <div className={styles.authors}>
                <h5>Authors</h5>
                {source.authors?.length > 0 ? (
                    <ol className="chipList">
                        {source.authors?.map((cont) => (
                            <ListItem
                                key={cont}
                                item={
                                    /^http/.test(cont)
                                        ? "See all of the authors"
                                        : cont
                                }
                                link={/^http/.test(cont) ? cont : null}
                            />
                        ))}
                    </ol>
                ) : (
                    <p>No authors listed</p>
                )}
            </div>

            <div className={styles.tags}>
                <h5>Tags</h5>
                {source.tags?.length > 0 ? (
                    <ol className="chipList">
                        {source.tags?.map((cont) => (
                            <ListItem key={cont} item={cont} />
                        ))}
                    </ol>
                ) : (
                    <p>No tags for source</p>
                )}
            </div>
        </Card>
    );
}
