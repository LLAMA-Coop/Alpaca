import Link from "next/link";
import styles from "./sourceDisplay.module.css";
import { ListItem } from "../form/Form";
import { Card } from "../card/Card";

export default function SourceDisplay({ source }) {
  // return (
  //   <li className={styles.cardContainer}>
  //     <div className={styles.gradientBorder} />

  //     <div className={styles.cardContent}>
  //       <div className={styles.source}>
  //         <h4>{source.title}</h4>

  //         <p>
  //           <em>Medium: </em>
  //           {source.medium}
  //         </p>

  //         <div className={styles.contributors}>
  //           <h5>Contributors</h5>
  //           {source.contributors.length > 0 ? (
  //             <ol className="chipGrid">
  //               {source.contributors.map((cont) => (
  //                 <ListItem
  //                   key={cont}
  //                   item={
  //                     /^http/.test(cont) ? "See all of the contributors" : cont
  //                   }
  //                   link={/^http/.test(cont) ? cont : null}
  //                 />
  //               ))}
  //             </ol>
  //           ) : (
  //             <p>No contributors listed</p>
  //           )}
  //         </div>

  //         <Link href={source.url} target="_blank">
  //           Visit the source page
  //         </Link>
  //       </div>
  //     </div>
  //   </li>
  // );

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
          <ol className="chipGrid">
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
