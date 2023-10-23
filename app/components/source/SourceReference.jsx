"use client";
import { Label } from "../client";
import ListAdd from "../form/ListAdd";
import { useState } from "react";

export function SourceReferenceInput({ sourceRef }) {
        const [sourceError, setSourceError] = useState("");
    
        return (
        <div>
            <Label
                required={true}
                error={sourceError}
                label="Current Sources"
            />

            <ListAdd
                item="Add a source"
                listChoices={availableSources}
                listChosen={sources}
                listProperty={"title"}
                listSetter={setSources}
            />
        </div>
    );
}
