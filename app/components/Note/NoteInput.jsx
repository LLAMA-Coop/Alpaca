"use client";

import { PermissionsDisplay } from "../Form/PermissionsDisplay";
import { useStore, useModals, useAlerts } from "@/store/store";
import SubmitErrors from "@/lib/SubmitErrors";
import styles from "./NoteInput.module.css";
import { useEffect, useState } from "react";
import { serializeOne } from "@/lib/db";
import { MAX } from "@/lib/constants";
import {
    Label,
    Input,
    ListItem,
    InputPopup,
    Spinner,
    DeletePopup,
    ListAdd,
    UserInput,
} from "@client";

export function NoteInput({ note }) {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [sources, setSources] = useState([]);
    const [textError, setTextError] = useState("");
    const [sourceError, setSourceError] = useState("");

    const [courses, setCourses] = useState([]);
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");
    const [permissions, setPermissions] = useState({});

    const [loading, setLoading] = useState(false);

    const availableSources = useStore((state) => state.sources);
    const availableCourses = useStore((state) => state.courses);
    const availableTags = useStore((state) => state.tags);
    const addTags = useStore((state) => state.addTags);
    const user = useStore((state) => state.user);
    const addModal = useModals((state) => state.addModal);
    const removeModal = useModals((state) => state.removeModal);
    const addAlert = useAlerts((state) => state.addAlert);

    const canDelete = note && user && note.createdBy === user._id;

    useEffect(() => {
        if (!note) return;
        if (note.title) setTitle(note.title);
        if (note.text) setText(note.text);
        if (note.sources && note.sources.length > 0) {
            setSources(
                note.sources.map((srcId, index) => {
                    const source = availableSources.find(
                        (x) => x._id === srcId,
                    );
                    if (!source)
                        return {
                            id: index,
                            title: "unavailable",
                        };
                    return source;
                }),
            );
        }
        if (note.courses && note.courses.length > 0) {
            setCourses(
                note.courses.map((courseId, index) => {
                    const course = availableCourses.find(
                        (x) => x._id === courseId,
                    );
                    if (!course)
                        return {
                            id: index,
                            name: "unavailable",
                        };
                }),
            );
        }
        if (note.tags && note.tags.length > 0) setTags([...note.tags]);
        if (note.permissions) setPermissions(serializeOne(note.permissions));
    }, []);

    function handleAddTag(e) {
        e.preventDefault();
        if (!newTag || tags.includes(newTag)) return;
        setTags([...tags, newTag]);
        if (!availableTags.includes(newTag)) {
            addTags(newTag);
        }
        setNewTag("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;
        const submitErrors = new SubmitErrors();

        if (text.length === 0) {
            submitErrors.addMessage("Text cannot be empty", setTextError);
        }

        if (sources.length === 0) {
            submitErrors.addMessage(
                "You must add at least one source",
                setSourceError,
            );
        }

        if (submitErrors.errors.length > 0) {
            addAlert({
                success: false,
                message: submitErrors.displayErrors(),
            });
        }
        if (submitErrors.cannotSend) {
            return;
        }

        const notePayload = {
            title,
            text,
            sources: sources.filter((s) => s).map((src) => src._id),
            courses: courses.filter((c) => c).map((course) => course._id),
            tags,
        };
        notePayload.permissions = permissions;
        if (note && note._id) {
            notePayload._id = note._id;
        }

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/note`,
            {
                method: note && note._id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(notePayload),
            },
        );

        setLoading(false);

        if (response.status === 201) {
            setText("");
            setSourceError("");

            addAlert({
                success: true,
                message: "Note added succesfully",
            });
        } else if (response.status === 200) {
            addAlert({
                success: true,
                message: "Note edited succesfully.",
            });
        } else if (response.status === 401) {
            addAlert({
                success: false,
                message: "You have been signed out. Please sign in again.",
            });
            addModal({
                title: "Sign back in",
                content: <UserInput onSubmit={removeModal} />,
            });
        } else {
            const json = await response.json();
            addAlert({
                success: false,
                message: json.message,
            });
        }
    }

    return (
        <div className={styles.form}>
            <Input
                onChange={(e) => {
                    setTitle(e.target.value);
                }}
                value={title}
                label={"Title"}
                maxLength={MAX.title}
            />

            <div className={styles.sources}>
                <Label required={true} error={sourceError} label="Sources" />

                <ListAdd
                    item="Add a source"
                    listChoices={availableSources}
                    listChosen={sources}
                    listProperty={"title"}
                    listSetter={setSources}
                    createNew={<InputPopup type="source" />}
                    type="datalist"
                    messageIfNone="No sources added"
                />
            </div>

            <div className={styles.tags}>
                <div>
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
                <Input
                    type="datalist"
                    choices={availableTags}
                    label={"Add Tag"}
                    value={newTag}
                    maxLength={MAX.tag}
                    description="A word or phrase that could be used to search for this note"
                    autoComplete="off"
                    onChange={(e) => setNewTag(e.target.value)}
                    action="Add tag"
                    onActionTrigger={handleAddTag}
                />
            </div>

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

            <div className={styles.courses}>
                <Label required={false} label="Courses" />

                <ListAdd
                    item="Add to a course"
                    listChoices={availableCourses}
                    listChosen={courses}
                    listProperty={"name"}
                    listSetter={setCourses}
                    type="datalist"
                    messageIfNone="Not added to any course"
                />
            </div>

            <div className={styles.permissions}>
                <PermissionsDisplay
                    permissions={permissions}
                    setter={setPermissions}
                />

                {(!note || (user && note.createdBy === user._id)) && (
                    <InputPopup
                        type="permissions"
                        resource={permissions}
                        setter={setPermissions}
                    />
                )}
            </div>

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Note"}
            </button>

            {canDelete && (
                <DeletePopup resourceType="note" resourceId={note._id} />
            )}
        </div>
    );
}
