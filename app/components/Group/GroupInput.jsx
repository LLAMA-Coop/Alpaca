"use client";

import { Input, Spinner, Form, Checkbox } from "@client";
import { validation, Validator } from "@/lib/validation";
import { useEffect, useReducer, useRef } from "react";
import { useAlerts } from "@/store/store";
import styles from "./Group.module.css";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";

const defaultState = {
    name: "",
    description: "",
    icon: null,
    isPublic: false,
    errors: {},
    loading: false,
};

function reducer(state, action) {
    switch (action.type) {
        case "name":
            return { ...state, name: action.value };
        case "description":
            return { ...state, description: action.value };
        case "icon":
            return { ...state, icon: action.value };
        case "isPublic":
            return { ...state, isPublic: action.value };
        case "errors":
            return { ...state, errors: { ...state.errors, ...action.value } };
        case "loading":
            return { ...state, loading: action.value };
        case "reset":
            return defaultState;
        default:
            return state;
    }
}

export function GroupInput({ group }) {
    const [state, dispatch] = useReducer(reducer, defaultState);

    const addAlert = useAlerts((state) => state.addAlert);
    const inputRef = useRef();

    const { startUpload } = useUploadThing("avatarOrIcon", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];

            if (!fileId) {
                throw new Error("No file ID returned from cdn.");
            }

            handleSubmit(undefined, fileId);
        },
        onUploadError: () => {
            dispatch({ type: "loading", value: false });
            addAlert({
                success: false,
                message: "An error occurred while uploading the image",
            });
        },
    });

    useEffect(() => {
        if (!group) return;
        dispatch({ type: "name", value: group.name });
        dispatch({ type: "description", value: group.description });
        dispatch({ type: "icon", value: group.icon });
        dispatch({ type: "isPublic", value: group.isPublic });
    }, []);

    async function handleSubmit(e, fileId = null) {
        if (e) e.preventDefault();
        if (state.loading && !fileId) return;

        const validator = new Validator();

        validator.validateAll(
            [
                ["name", state.name.trim()],
                ["description", state.description.trim()],
                ["isPublic", state.isPublic],
            ].map(([field, value]) => ({ field, value })),
            "group",
        );

        if (!validator.isValid) {
            return dispatch({ type: "errors", value: validator.errors });
        }

        try {
            dispatch({ type: "loading", value: true });

            if (state.icon && !fileId) {
                return startUpload([state.icon]);
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/groups`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: state.name.trim(),
                        description: state.description.trim(),
                        icon: fileId ?? undefined,
                        isPublic: state.isPublic,
                    }),
                },
            );

            if (response.ok) {
                if (response.status === 201) {
                    dispatch({ type: "reset" });
                }

                addAlert({
                    success: true,
                    message:
                        response.status === 201
                            ? "Successfully created group"
                            : "Successfully updated group",
                });
            } else {
                const data = await response.json();
                addAlert({
                    success: false,
                    message: data?.message ?? "Something went wrong",
                });
            }
        } catch (error) {
            if (fileId) {
                // Need to hit api endpoint to delete the file
            }

            addAlert({
                success: false,
                message: "Something went wrong",
            });
        } finally {
            dispatch({ type: "loading", value: false });
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Input
                required
                label="Group Name"
                value={state.name}
                placeholder="Group Name"
                error={state.errors.name}
                maxLength={validation.group.name.maxLength}
                onChange={(e) => {
                    dispatch({ type: "name", value: e.target.value });
                    dispatch({ type: "errors", value: { name: "" } });
                }}
            />

            <Input
                label="Group Description"
                value={state.description}
                placeholder="Group Description"
                error={state.errors.description}
                maxLength={validation.group.description.maxLength}
                onChange={(e) => {
                    dispatch({ type: "description", value: e.target.value });
                    dispatch({ type: "errors", value: { description: "" } });
                }}
            />

            <Checkbox
                label="Public Group"
                value={state.isPublic}
                onChange={(value) => dispatch({ type: "isPublic", value })}
            />

            <div className={styles.iconContainer}>
                <div>
                    <div className={styles.image}>
                        <Image
                            src={
                                state.icon
                                    ? URL.createObjectURL(state.icon)
                                    : "/assets/group.png"
                            }
                            width={44}
                            height={44}
                            alt="Group Icon"
                            onClick={() => inputRef.current.click()}
                        />

                        {!state.icon && <div />}
                    </div>

                    <button
                        type="button"
                        className="button"
                        onClick={() => inputRef.current.click()}
                    >
                        Change Icon
                    </button>

                    {state.icon && (
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                dispatch({ type: "icon", value: null });
                                dispatch({
                                    type: "errors",
                                    value: { icon: "" },
                                });
                            }}
                        >
                            Remove Icon
                        </button>
                    )}

                    {state.errors.icon && (
                        <p className={styles.error}>{state.errors.icon}</p>
                    )}

                    <input
                        type="file"
                        tabIndex={-1}
                        ref={inputRef}
                        accept="image/png, image/jpeg, image/gif, image/apng, image/webp"
                        onChange={async (e) => {
                            const file = e.target.files
                                ? e.target.files[0]
                                : null;
                            if (!file) return (e.target.value = "");

                            // Run checks
                            const maxFileSize = 1024 * 1024 * 2; // 2MB

                            if (file.size > maxFileSize) {
                                dispatch({
                                    type: "errors",
                                    value: {
                                        icon: "File cannot be larger than 2MB",
                                    },
                                });
                                return (e.target.value = "");
                            }

                            dispatch({ type: "icon", value: file });
                            dispatch({ type: "errors", value: { icon: "" } });
                            e.target.value = "";
                        }}
                    />
                </div>
            </div>

            <button type="submit" className="button submit primary">
                Create group {state.loading && <Spinner />}
            </button>
        </Form>
    );
}
