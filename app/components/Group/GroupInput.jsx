"use client";

import { Label, Input, Spinner, UserInput } from "@client";
import { useModals, useAlerts } from "@/store/store";
import { useState, useRef, useEffect } from "react";
import { Validator } from "@/lib/validation";
import filetypeinfo from "magic-bytes.js";
import styles from "./Group.module.css";
import { validation } from "@/lib/validation";

export function GroupInput({ group }) {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");

    const [description, setDescription] = useState("");
    const [descriptionError, setDescriptionError] = useState("");

    const [icon, setIcon] = useState(null);
    const [iconError, setIconError] = useState("");

    const [loading, setLoading] = useState(false);

    const addModal = useModals((state) => state.addModal);
    const removeModal = useModals((state) => state.removeModal);
    const addAlert = useAlerts((state) => state.addAlert);

    useEffect(() => {
        if (!group) return;
        setName(group.name);
        setDescription(group.description);
    }, []);

    const inputRef = useRef(null);

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;

        const validator = new Validator();

        validator.validateAll([
            {
                field: "name",
                value: name,
                type: "group",
            },
            {
                field: "description",
                value: description,
                type: "group",
            },
        ]);

        if (!validator.isValid) {
            return addAlert({
                success: false,
                message: validator.getErrorsAsString(),
            });
        }

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/groups`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description,
                    icon: icon,
                }),
            },
        );

        setLoading(false);

        if (response.status === 400) {
            const json = await response.json();
            if (json.sameName) setNameError("Name already taken.");
            addAlert({
                success: false,
                message: json.message,
            });
        } else if (response.status === 201) {
            setName("");
            setNameError("");

            setDescription("");
            setDescriptionError("");

            setIcon(null);
            setIconError("");

            addAlert({
                success: true,
                message: "Group created successfully.",
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
        <div className="formGrid">
            <Input
                value={name}
                required={true}
                label={"Group Name"}
                error={nameError}
                minLength={1}
                maxLength={validation.group.name.maxLength}
                onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                }}
            />

            <Input
                value={description}
                label={"Group Description"}
                error={descriptionError}
                minLength={2}
                maxLength={validation.group.description.maxLength}
                onChange={(e) => {
                    setDescription(e.target.value);
                    setDescriptionError("");
                }}
            />

            <div className={styles.iconContainer}>
                <Label error={iconError} label="Group Icon" />

                <div>
                    <div className={styles.image}>
                        {/* <Image
                            src={
                                icon
                                    ? URL.createObjectURL(icon)
                                    : "/icons/group.png"
                            }
                            alt="Group Icon"
                            width={44}
                            height={44}
                            onClick={() => inputRef.current.click()}
                        /> */}

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
            </div>

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Create Group"}
            </button>
        </div>
    );
}
