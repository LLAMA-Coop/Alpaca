"use client";

import { Label, ListAdd } from "@client";
import { useState } from "react";

export function SourceReference({ sourceRef }) {
    const [sourceError, setSourceError] = useState("");

    return (
        <div>
            <Label
                required={true}
                error={sourceError}
                label="Current Sources"
            />
            {/* <ListAdd
                item="Add a source"
                listChoices={availableSources}
                listChosen={sources}
                listProperty={"title"}
                listSetter={setSources}
            /> */}
            Something wrong here!
        </div>
    );
}
