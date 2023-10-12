"use client";

import { useEffect, useState } from "react";
import {
    Label,
    Input,
    ListItem,
    InputPopup,
    Spinner,
    Alert,
} from "@/app/components/client";
import PermissionsInput from "../form/PermissionsInput";
import { useStore } from "@/store/store";
import { DeletePopup } from "../delete-popup/DeletePopup";
import ListAdd from "../form/ListAdd";
import { serializeOne } from "@/lib/db";
import MAX from "@/lib/max";

export function NoteInput({ note }) {
    const [text, setText] = useState("");
    const [sources, setSources] = useState([]);
    const [textError, setTextError] = useState("");
    const [sourceError, setSourceError] = useState("");

    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");
    const [permissions, setPermissions] = useState({});

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    const availableSources = useStore((state) => state.sourceStore);
    const user = useStore((state) => state.user);
    const canDelete = note && note.createdBy === user._id;

    useEffect(() => {
        if (!note) return;
        setText(note.text);
        setSources(
            note.sources.map((srcId) =>
                availableSources.find((x) => x._id === srcId),
            ),
        );
        if (note.tags?.length > 0) setTags([...note.tags]);
        if (note.permissions) setPermissions(serializeOne(note.permissions));
    }, []);

    function handleAddTag(e) {
        e.preventDefault();
        if (!newTag || tags.includes(newTag)) return;
        setTags([...tags, newTag]);
        setNewTag("");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (text.length === 0) {
            setTextError("Text cannot be empty");
        }

        if (sources.length === 0) {
            setSourceError("You must add at least one source");
        }

        if (text.length === 0 || sources.length === 0) {
            return;
        }

        const notePayload = {
            text,
            sources: sources.map((src) => src._id),
            tags,
        };
        notePayload.permissions = permissions;
        if (note) {
            notePayload._id = note._id;
        }

        setLoading(true);

        const response = await fetch("/api/note", {
            method: note ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(notePayload),
        });

        setLoading(false);

        if (response.status === 201) {
            setText("");
            setSourceError("");
            // setSources([]);
            setText("");

            setRequestStatus({
                success: true,
                message: "Note added succesfully.",
            });
            setShowAlert(true);
        } else if (response.status === 200) {
            setRequestStatus({
                success: true,
                message: "Note edited succesfully.",
            });
            setShowAlert(true);
        } else {
            setRequestStatus({
                success: false,
                message: "Something went wrong.",
            });
            setShowAlert(true);
        }
    }

    return (
        <div className="formGrid">
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />

            <Input
                type="textarea"
                required={true}
                onChange={(e) => {
                    setText(e.target.value);
                    setTextError("");
                }}
                value={text}
                error={textError}
                label={"Text"}
                maxLength={MAX.noteText}
            />

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

            <div>
                <Input
                    label={"Add Tag"}
                    value={newTag}
                    maxLength={MAX.tag}
                    description="A word or phrase that could be used to search for this note"
                    autoComplete="off"
                    onChange={(e) => setNewTag(e.target.value)}
                    action="Add tag"
                    onActionTrigger={handleAddTag}
                />

                <div style={{ marginTop: "24px" }}>
                    <Label label="Tags" />

                    <ul className="chipList">
                        {tags.length === 0 && <ListItem item="No tags added" />}

                        {tags.map((tag) => (
                            <ListItem
                                key={tag}
                                item={tag}
                                action={() => {
                                    setTags(tags.filter((t) => t !== tag));
                                }}
                                actionType={"delete"}
                            />
                        ))}
                    </ul>
                </div>
            </div>

            <InputPopup type="source" />

            <PermissionsInput
                permissions={permissions}
                setter={setPermissions}
            />

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Note"}
            </button>

            {canDelete && (
                <DeletePopup resourceType="note" resourceId={note._id} />
            )}
        </div>
    );
}
