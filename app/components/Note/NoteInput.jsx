"use client";

import { Permissions, Spinner, Select, Input, Form } from "@client";
import { Validator, validation } from "@/lib/validation";
import { useEffect, useMemo, useReducer } from "react";
import { useStore, useAlerts } from "@/store/store";
import { getChangedFields } from "@/lib/objects";
import RTEditor from "../Editor/RTEditor";

const defaultState = {
    title: "",
    text: "",
    sources: [],
    courses: [],
    tag: "",
    tags: [],
    permissions: {
        allRead: false,
        allWrite: false,
        read: [],
        write: [],
        groupId: null,
        groupLocked: false,
    },
    loading: false,
    errors: {},
};

function stateReducer(state, action) {
    switch (action.type) {
        case "title":
            return { ...state, title: action.value };
        case "text":
            return { ...state, text: action.value };
        case "sources":
            return { ...state, sources: action.value };
        case "courses":
            return { ...state, courses: action.value };
        case "tag":
            return { ...state, tag: action.value };
        case "addTag":
            return { ...state, tags: [...state.tags, action.value] };
        case "removeTag":
            return {
                ...state,
                tags: state.tags.filter((t) => t !== action.value),
            };
        case "permissions":
            return { ...state, permissions: action.value };
        case "loading":
            return { ...state, loading: action.value };
        case "editing":
            return {
                ...state,
                ...action.value,
                sources: action.value.sources || [],
                courses: action.value.courses || [],
            };
        case "errors":
            return { ...state, errors: { ...state.errors, ...action.value } };
        case "reset":
            return defaultState;
        default:
            return state;
    }
}

export function NoteInput({ note, close }) {
    if (note) {
        note = {
            ...note,
            permissions: {
                ...note.permissions,
                allRead: note.permissions.allRead === 1,
                allWrite: note.permissions.allWrite === 1,
                groupLocked: note.permissions.groupLocked === 1,
            },
        };
    }

    const [state, dispatch] = useReducer(
        stateReducer,
        note
            ? {
                  ...defaultState,
                  title: note.title,
                  text: note.text,
                  sources: note.sources || [],
                  courses: note.courses || [],
                  tags: note.tags || [],
                  permissions: {
                      ...note.permissions,
                      allRead: note.permissions.allRead === 1,
                      allWrite: note.permissions.allWrite === 1,
                      groupLocked: note.permissions.groupLocked === 1,
                  },
              }
            : defaultState
    );

    const addAlert = useAlerts((state) => state.addAlert);
    const sources = useStore((state) => state.sources);
    const courses = useStore((state) => state.courses);
    const user = useStore((state) => state.user);

    const isOwner = note && user && note.creator.id === user.id;
    const canChangePermissions = isOwner || !note;

    useEffect(() => {
        if (!note) return;
        dispatch({ type: "editing", value: note, sources, courses });
    }, [sources, courses]);

    const noteData = {
        title: state.title,
        text: state.text,
        sources: state.sources.map((src) => src.id),
        courses: state.courses.map((course) => course.id),
        tags: state.tags,
        permissions: state.permissions,
    };

    const canSubmitChange = useMemo(() => {
        if (!note) {
            return noteData.title.trim() !== "" && noteData.text.trim() !== "";
        }

        const changedFields = getChangedFields(
            {
                ...note,
                sources: note.sources.map((src) => src.id),
                courses: note.courses.map((course) => course.id),
            },
            noteData
        );

        return Object.keys(changedFields).length > 0;
    }, [note, noteData]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (state.loading) return;

        const validator = new Validator();

        validator.validateAll(
            [
                ["text", state.text.trim()],
                ["title", state.title.trim()],
                ["sources", state.sources.map((s) => s.id)],
                ["courses", state.courses.map((c) => c.id)],
            ].map(([field, value]) => ({ field, value })),
            "note"
        );

        validator.validate({ field: "tags", value: state.tags, type: "misc" });

        const permissions = validator.validatePermissions(state.permissions);

        if (!validator.isValid) {
            return dispatch({ type: "errors", value: validator.errors });
        }

        dispatch({ type: "loading", value: true });

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/note${note ? `/${note.id}` : ""}`,
            {
                method: !!note?.id ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: note
                    ? JSON.stringify(
                          getChangedFields(
                              {
                                  ...note,
                                  sources: note.sources.map((src) => src.id),
                                  courses: note.courses.map((course) => course.id),
                              },
                              noteData,
                              true
                          )
                      )
                    : JSON.stringify({
                          title: state.title.trim(),
                          text: state.text.trim(),
                          sources: state.sources.map((s) => s.id),
                          courses: state.courses.map((c) => c.id),
                          tags: state.tags,
                          permissions,
                      }),
            }
        );

        dispatch({ type: "loading", value: false });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            console.log(`Error parsing response: ${e}`);
        }

        if (response.status === 201) {
            dispatch({ type: "reset" });

            addAlert({
                success: true,
                message: data.message || "Successfully created note.",
            });
        } else if (response.status === 200) {
            addAlert({
                success: true,
                message: data.message || "Successfully updated note.",
            });

            if (close) close();
        } else {
            addAlert({
                success: false,
                message: data.errors.server || "Something went wrong.",
            });
        }
    }

    return (
        <Form
            singleColumn={note}
            onSubmit={handleSubmit}
        >
            <Input
                required
                label="Title"
                error={state.errors.title}
                placeholder="How to make a sandwich"
                value={state.title}
                onChange={(e) => {
                    dispatch({ type: "title", value: e.target.value });
                    dispatch({ type: "errors", value: { title: "" } });
                }}
                maxLength={validation.note.title.maxLength}
            />

            <Input
                multiple
                label="Tags"
                value={state.tag}
                data={state.tags}
                autoComplete="off"
                error={state.errors.tags}
                placeholder="Enter a tag and press enter"
                maxLength={validation.misc.tag.maxLength}
                description="A word or phrase that could be used to search for this note"
                removeItem={(item) => {
                    dispatch({ type: "removeTag", value: item });
                }}
                addItem={(item) => {
                    dispatch({ type: "addTag", value: item });
                    dispatch({ type: "tag", value: "" });
                }}
                onChange={(e) => {
                    dispatch({ type: "tag", value: e.target.value });
                    dispatch({ type: "errors", value: { tag: "" } });
                }}
            />

            <Select
                multiple
                required
                itemValue="id"
                label="Sources"
                options={
                    note
                        ? // Filter duplicates
                          [...sources, ...state.sources].filter(
                              (source, index, self) =>
                                  index === self.findIndex((s) => s.id === source.id)
                          )
                        : sources
                }
                itemLabel="title"
                data={state.sources}
                placeholder="Select sources"
                error={state.errors.sources}
                description="The sources you used to create this note"
                setter={(value) => {
                    dispatch({ type: "sources", value });
                    dispatch({ type: "errors", value: { sources: "" } });
                }}
            />

            <Select
                multiple
                itemValue="id"
                label="Courses"
                itemLabel="name"
                options={courses}
                data={state.courses}
                placeholder="Select courses"
                error={state.errors.courses}
                description="The courses this note is related to"
                setter={(value) => {
                    dispatch({ type: "courses", value });
                    dispatch({ type: "errors", value: { courses: "" } });
                }}
            />

            <RTEditor
                content={state.text}
                setContent={{ dispatch, type: "text" }}
            />

            {canChangePermissions ? (
                <Permissions
                    disabled={state.loading}
                    permissions={state.permissions}
                    error={state.errors.permissions}
                    setPermissions={(value) => {
                        dispatch({ type: "permissions", value });
                        dispatch({
                            type: "errors",
                            value: { permissions: "" },
                        });
                    }}
                />
            ) : (
                <div />
            )}

            <button
                type="submit"
                className="button submit primary"
                disabled={state.loading || !canSubmitChange}
            >
                Submit Note {state.loading && <Spinner />}
            </button>
        </Form>
    );
}
