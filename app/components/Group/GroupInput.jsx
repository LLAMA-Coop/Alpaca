"use client";

import { Input, Spinner, Form } from "@client";
import { useEffect, useReducer } from "react";
import { validation } from "@/lib/validation";
import { Validator } from "@/lib/validation";
import { useAlerts } from "@/store/store";
import filetypeinfo from "magic-bytes.js";

const defaultState = {
    name: "",
    description: "",
    icon: null,
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

    useEffect(() => {
        if (!group) return;
        dispatch({ type: "name", value: group.name });
        dispatch({ type: "description", value: group.description });
        dispatch({ type: "icon", value: group.icon });
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (state.loading) return;

        const validator = new Validator();

        validator.validateAll(
            [
                {
                    field: "name",
                    value: state.name.trim(),
                },
                {
                    field: "description",
                    value: state.description.trim(),
                },
                // Not checking icon as it's not a string
            ],
            "group",
        );

        if (!validator.isValid) {
            return dispatch({ type: "errors", value: validator.errors });
        }

        dispatch({ type: "loading", value: true });

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
                    icon: state.icon,
                }),
            },
        );

        dispatch({ type: "loading", value: false });

        if (response.ok) {
            if (response.status === 201) {
                dispatch({ type: "reset" });
            }

            addAlert({
                success: true,
                message:
                    response.status === 201
                        ? "Successfully created group."
                        : "Successfully updated group.",
            });
        } else {
            const data = await response.json();
            addAlert({
                success: false,
                message: data?.message ?? "An error occurred.",
            });
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

            {/* <div className={styles.iconContainer}>
                <Label error={iconError} label="Group Icon" />

                <div>
                    <div className={styles.image}>
                        <Image
                            src={
                                icon
                                    ? URL.createObjectURL(icon)
                                    : "/icons/group.png"
                            }
                            alt="Group Icon"
                            width={44}
                            height={44}
                            onClick={() => inputRef.current.click()}
                        />

                        {!icon && <div />}
                    </div>

                    <button
                        className="button"
                        onClick={() => inputRef.current.click()}
                    >
                        Change Icon
                    </button>

                    {icon && (
                        <button
                            className="button"
                            onClick={() => setIcon(null)}
                        >
                            Remove Icon
                        </button>
                    )}

                    <input
                        tabIndex={-1}
                        type="file"
                        ref={inputRef}
                        accept="image/png, image/jpeg, image/gif, image/apng, image/webp"
                        onChange={async (e) => {
                            const file = e.target.files
                                ? e.target.files[0]
                                : null;
                            if (!file) return (e.target.value = "");

                            // Run checks
                            const maxFileSize = 1024 * 1024 * 10; // 10MB
                            if (file.size > maxFileSize) {
                                setIconError(
                                    "File size must be less than 10MB",
                                );
                                return (e.target.value = "");
                            }

                            const fileBytes = new Uint8Array(
                                await file.arrayBuffer(),
                            );

                            const fileType =
                                filetypeinfo(fileBytes)?.[0].mime?.toString();

                            const allowedFileTypes = [
                                "image/png",
                                "image/jpeg",
                                "image/gif",
                                "image/apng",
                                "image/webp",
                            ];

                            if (
                                !fileType ||
                                !allowedFileTypes.includes(fileType)
                            ) {
                                setIconError("File type not allowed.");
                                return (e.target.value = "");
                            }

                            const newFile = new File([file], "image", {
                                type: file.type,
                            });

                            setIcon(newFile);
                            setIconError("");
                            e.target.value = "";
                        }}
                    />
                </div>
            </div> */}

            <button className="button submit primary">
                {state.loading ? <Spinner /> : "Create Group"}
            </button>
        </Form>
    );
}
