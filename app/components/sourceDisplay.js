import Link from "next/link";

export default function SourceDisplay({ source }) {
  return (
    <>
      <h4>{source.title}</h4>
      <p>
        <em>Medium: </em>
        {source.medium}
      </p>
      <p>
        <em>Contributors: </em>
      </p>
      {source.contributors.length > 0 ? (
        <ol>
          {source.contributors.map((cont) => {
            return <li key={cont}>{cont}</li>;
          })}
        </ol>
      ) : (
        <p>No contributors listed</p>
      )}
      <Link href={source.url}>Click here to visit source page</Link>
    </>
  );
}
