"use client";

import { PermissionsDisplay } from "../Form/PermissionsDisplay";
import { useStore, useModals, useAlerts } from "@/store/store";
import { Validator } from "@/lib/validation";
import styles from "./NoteInput.module.css";
import { useEffect, useState } from "react";
import { serializeOne } from "@/lib/db";
import { validation } from "@/lib/validation";
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
import { buildPermissions } from "@/lib/permissions";

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

    const canDelete = note && user && note.createdBy === user.id;

    useEffect(() => {
        if (!note) return;
        if (note.title) setTitle(note.title);
        if (note.text) setText(note.text);
        if (note.sources && note.sources.length > 0) {
            setSources(
                note.sources.map((srcId, index) => {
                    const source = availableSources
                        ? availableSources.find((x) => x.id === srcId)
                        : undefined;
                    if (!source)
                        return {
                            _id: index,
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
                        (x) => x.id === courseId,
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

        const validator = new Validator();

        validator.validateAll([
            {
                field: "text",
                value: text,
                type: "note",
            },
            {},
        ]);

        if (sources.length === 0) {
            validator.addError({
                field: "sources",
                message: "You must add at least one source",
            });
        }

        if (!validator.isValid) {
            return addAlert({
                success: false,
                message: validator.getErrorsAsString(),
            });
        }

        const notePayload = {
            title: title.trim(),
            text: text.trim(),
            sources: sources.filter((s) => s).map((src) => src.id),
            courses: courses.filter((c) => c).map((course) => course.id),
            tags,
        };

        notePayload.permissions = buildPermissions(
            permissions,
            note ? note.id : null,
            "note",
        );

        if (note && note.id) {
            notePayload.id = note.id;
        }

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/note`,
            {
                method: note && note.id ? "PUT" : "POST",
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
            <div className={styles.column}>
                <Input
                    onChange={(e) => {
                        setTitle(e.target.value);
                    }}
                    value={title}
                    maxLength={validation.note.title.maxLength}
                    placeholder="Note Title"
                    label="TITLE"
                />
            </div>

            <div className={styles.column}>
                <div className={styles.sources}>
                    <Label
                        required={true}
                        error={sourceError}
                        label="Sources"
                    />

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
            </div>

            <div className={styles.column}>
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
                    maxLength={validation.note.text.maxLength}
                    className={styles.textarea}
                />
            </div>
            <div className={styles.column}>
                <div className={styles.tags}>
                    <div>
                        <Input
                            type="datalist"
                            label="Tags"
                            choices={availableTags}
                            value={newTag}
                            maxLength={validation.tag.maxLength}
                            description="A word or phrase that could be used to search for this note"
                            autoComplete="off"
                            onChange={(e) => setNewTag(e.target.value)}
                            action="Add tag"
                            onActionTrigger={handleAddTag}
                            placeholder="Note Tags"
                        />
                        <ul className="chipList">
                            {tags.length === 0 && (
                                <ListItem item="No tags added" />
                            )}

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
            </div>

            <div className={styles.column}>
                <div>
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
                </div>

                <div className={styles.permissions}>
                    <PermissionsDisplay
                        permissions={permissions}
                        setter={setPermissions}
                    />

                    {(!note || (user && note.createdBy === user.id)) && (
                        <InputPopup
                            type="permissions"
                            resource={permissions}
                            setter={setPermissions}
                        />
                    )}
                </div>
            </div>

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Note"}
            </button>

            {canDelete && (
                <DeletePopup resourceType="note" resourceId={note.id} />
            )}
        </div>
    );
}
