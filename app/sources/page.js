import Link from "next/link";
import Source from "../api/models/Source";
import SourceDisplay from "../components/source/sourceDisplay";
import SourceInput from "../components/source/sourceInput";

const sources = await Source.find();

export default function SourcesPage() {
  return (
    <main>
      <h2>Sources</h2>
      <ul>
        {sources.map((src) => {
          return (
            <li key={src._id}>
              <SourceDisplay source={src}></SourceDisplay>
            </li>
          );
        })}
      </ul>

      <h2>Add Source</h2>
      <SourceInput
        availableSources={sources.map((src) => {
          let { title, url, _id } = src;
          return { title, url, _id: _id.toString() };
        })}
      ></SourceInput>
    </main>
  );
}
