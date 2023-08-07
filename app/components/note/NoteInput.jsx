"use client";

import { useEffect, useState, useRef } from "react";
import {
    Label,
    Input,
    ListItem,
    Select,
    InputPopup,
    Spinner,
    Alert,
} from "@/app/components/client";

export function NoteInput({ availableSources }) {
    const [text, setText] = useState("");
    const [sources, setSources] = useState([]);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [textError, setTextError] = useState("");
    const [sourceError, setSourceError] = useState("");

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    const addSourceRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (isSelectOpen && !addSourceRef.current?.contains(e.target)) {
                setIsSelectOpen(false);
            }
        };

        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [isSelectOpen]);

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

        const note = { text, sources };

        setLoading(true);

        const response = await fetch("./api/note", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
        });

        setLoading(false);

        if (response.status === 201) {
            setText("");
            setSourceError("");
            setSources([]);
            setText("");

            setRequestStatus({
                success: true,
                message: "Note added succesfully.",
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
            />

            <div>
                <Label
                    required={true}
                    error={sourceError}
                    label="Current Sources"
                />

                <ol className="chipList">
                    <ListItem
                        item="Add a source"
                        action={() => {
                            setIsSelectOpen((prev) => !prev);
                        }}
                        actionType={"add"}
                        select={
                            <Select
                                listChoices={availableSources}
                                listChosen={sources}
                                listProperty={"title"}
                                listSetter={setSources}
                                setSelectState={setIsSelectOpen}
                            />
                        }
                    />

                    {sources.length > 0 &&
                        sources.map((src) => (
                            <ListItem
                                key={src.id}
                                link={src.url}
                                item={src.title}
                                action={() => {
                                    setSources(
                                        sources.filter((x) => x.id !== src.id),
                                    );
                                    setSourceError("");
                                }}
                                actionType={"delete"}
                            />
                        ))}
                </ol>
            </div>

            <InputPopup type="source" />

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Note"}
            </button>
        </div>
    );
}
