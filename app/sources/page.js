import Link from "next/link";
import Source from "../api/models/Source";
import SourceDisplay from "../components/source/sourceDisplay";
import SourceInput from "../components/source/sourceInput";

const sources = await Source.find();

export default function SourcesPage() {
  return (
    <main>
      <h2>Sources</h2>
      {sources.map((src) => {
        return <SourceDisplay key={src._id} source={src}></SourceDisplay>;
      })}

      <h2>Add Source</h2>
      <SourceInput></SourceInput>
    </main>
  );
}
