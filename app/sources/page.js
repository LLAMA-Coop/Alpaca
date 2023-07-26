import Source from "../api/models/Source";
import SourceDisplay from "../components/source/sourceDisplay";
import SourceInput from "../components/source/sourceInput";

const sources = await Source.find();

export default function SourcesPage() {
  return (
    <main>
      <SourceDisplay sources={sources} />

      <SourceInput
        availableSources={sources.map((src) => {
          let { title, url, _id } = src;
          return { title, url, _id: _id.toString() };
        })}
      />
    </main>
  );
}
