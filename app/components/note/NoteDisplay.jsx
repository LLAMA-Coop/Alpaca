import { SourceDisplay } from "@components/server";
import { Card } from "@components/client";
import Source from "@models/Source";
import User from "@models/User";

export async function NoteDisplay({ note }) {
    const user = await User.findById(note.createdBy);

    return (
        <Card
            title={`${user?.username ?? "Unknown"}'s Note`}
            description={note.text}
        >
            <ul>
                {note.sources.map(async (sourceId) => {
                    const source = await Source.findOne({ _id: sourceId });

                    return (
                        <li key={sourceId}>
                            <SourceDisplay source={source} />
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
