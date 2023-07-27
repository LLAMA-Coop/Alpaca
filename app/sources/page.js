import Source from "../api/models/Source";
import SourceDisplay from "../components/source/sourceDisplay";
import SourceInput from "../components/source/sourceInput";

const sources = await Source.find();

export default function SourcesPage() {
  return (
    <main>
      {/* <SourceDisplay sources={sources} /> */}
      {sources.map((src) => {
        return <SourceDisplay key={src._id} source={src}></SourceDisplay>;
      })}

      <SourceInput
        availableSources={sources.map((src) => {
          return JSON.parse(JSON.stringify(src));
        })}
      />
    </main>
  );
}
