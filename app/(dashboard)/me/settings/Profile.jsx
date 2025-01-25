"use client";

import { FormButtons, Spinner, Input, Form } from "@/app/components/client";
import { useUploadThing } from "@/lib/uploadthing";
import { Validator } from "@/lib/validation";
import { useRouter } from "next/navigation";
import styles from "./Settings.module.css";
import { useAlerts } from "@/store/store";
import { useRef, useState } from "react";
import { getApiUrl } from "@/lib/api";
import Image from "next/image";

const cdn = process.env.NEXT_PUBLIC_CDN_URL;

export function Profile({ user }) {
    const [imageLoading, setImageLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [username, setUsername] = useState(user.username);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [description, setDescription] = useState(user.description);
    const [avatar, setAvatar] = useState(user.avatar);

    const addAlert = useAlerts((state) => state.addAlert);
    const router = useRouter();

    const { startUpload } = useUploadThing("avatarOrIcon", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];

            if (!fileId) {
                throw new Error("No file ID returned from cdn.");
            }

            setImageLoading(false);
            handleSubmit({ fileId });
        },
        onUploadError: () => {
            setImageLoading(false);
            addAlert({
                success: false,
                message: "An error occurred while uploading your avatar.",
            });
        },
        onUploadBegin: () => {
            setImageLoading(true);
        },
    });

    function resetState() {
        setUsername(user.username);
        setDisplayName(user.displayName);
        setDescription(user.description);
        setAvatar(user.avatar);
        setErrors({});
    }

    const avatarInput = useRef(null);
    const hasChanged =
        avatar !== user.avatar ||
        username !== user.username ||
        displayName !== user.displayName ||
        description !== user.description;

    async function handleSubmit({ e, fileId, emailCode, twoFactorCode }) {
        if (e) e.preventDefault();
        if (isLoading || (imageLoading && !fileId)) return;

        const validator = new Validator();

        validator.validateAll(
            [
                ["username", username],
                ["displayName", displayName],
                ["description", description],
            ].map(([field, value]) => ({ field, value })),
            "user"
        );

        if (!validator.isValid) {
            return setErrors(validator.errors);
        }

        try {
            setIsLoading(true);

            if (avatar && avatar !== user.avatar && !fileId) {
                return startUpload([avatar]);
            }

            const response = await fetch(`${getApiUrl()}/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: user.username !== username ? username : undefined,
                    displayName: user.displayName !== displayName ? displayName : undefined,
                    description: user.description !== description ? description : undefined,
                    avatar: avatar !== user.avatar ? fileId || null : undefined,
                }),
            });

            if (!response.ok) {
                const data = await response.json();

                if (data?.errors?.server) throw new Error(data.errors.server);
                if (data?.errors) setErrors(data.errors);
                else throw new Error("Something went wrong");
            } else {
                user = {
                    ...user,
                    username: username || user.username,
                    displayName: displayName || user.displayName,
                    description: description || user.description,
                    avatar: fileId ?? (avatar === null ? avatar : user.avatar),
                };

                addAlert({
                    success: true,
                    message: "Profile updated successfully",
                });

                resetState();
                router.refresh();
            }
        } catch (err) {
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className={styles.content}>
            <h2>Modify your information</h2>

            <div className={styles.column}>
                <Form
                    fullWidth
                    singleColumn
                    onSubmit={(e) => handleSubmit({ e })}
                >
                    <Input
                        label="Username"
                        value={username}
                        placeholder="Username"
                        error={errors.username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setErrors((prev) => ({ ...prev, username: "" }));
                        }}
                    />

                    <Input
                        label="Display Name"
                        value={displayName || ""}
                        placeholder="Display Name"
                        error={errors.displayName}
                        onChange={(e) => {
                            setDisplayName(e.target.value);
                            setErrors((prev) => ({ ...prev, displayName: "" }));
                        }}
                    />

                    <Input
                        type="textarea"
                        label="Description"
                        value={description || ""}
                        error={errors.description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setErrors((prev) => ({ ...prev, description: "" }));
                        }}
                        placeholder="Tell us a little bit about yourself."
                    />

                    {hasChanged && (
                        <FormButtons>
                            <button
                                type="submit"
                                className="button green primary"
                                disabled={isLoading || imageLoading}
                            >
                                Save Changes
                                {isLoading && <Spinner />}
                            </button>

                            {!isLoading && (
                                <button
                                    type="button"
                                    onClick={() => resetState()}
                                    className="button transparent"
                                >
                                    Cancel Changes
                                </button>
                            )}
                        </FormButtons>
                    )}
                </Form>

                <div>
                    <div className={styles.avatar}>
                        <input
                            hidden
                            type="file"
                            ref={avatarInput}
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files ? e.target.files[0] : null;
                                if (!file) return (e.target.value = "");

                                // Run checks
                                const maxFileSize = 1024 * 1024 * 2; // 2MB

                                if (file.size > maxFileSize) {
                                    addAlert({
                                        success: false,
                                        message: "File cannot exceed 2MB",
                                    });

                                    return (e.target.value = "");
                                }

                                setAvatar(file);
                                e.target.value = "";
                            }}
                        />

                        <div>
                            {avatar ? (
                                <Image
                                    src={
                                        typeof avatar === "string"
                                            ? `${cdn}${avatar}`
                                            : URL.createObjectURL(avatar)
                                    }
                                    alt="Avatar"
                                    width={100}
                                    height={100}
                                />
                            ) : (
                                <span>{user.username[0].toUpperCase()}</span>
                            )}

                            <button
                                type="button"
                                onClick={() => avatarInput.current.click()}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    height="16"
                                    width="16"
                                >
                                    {avatar ? (
                                        <path d="m12,7V.46c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm1.27,12.48c-.813.813-1.27,1.915-1.27,3.065v1.455h1.455c1.15,0,2.252-.457,3.065-1.27l6.807-6.807c.897-.897.897-2.353,0-3.25-.897-.897-2.353-.897-3.25,0l-6.807,6.807Zm-3.27,3.065c0-1.692.659-3.283,1.855-4.479l6.807-6.807c.389-.389.842-.688,1.331-.901-.004-.12-.009-.239-.017-.359h-6.976c-1.654,0-3-1.346-3-3V.024c-.161-.011-.322-.024-.485-.024h-4.515C2.243,0,0,2.243,0,5v14c0,2.757,2.243,5,5,5h5v-1.455Z" />
                                    ) : (
                                        <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,6.88c-.195.195-.451.293-.707.293s-.512-.098-.707-.293l-1.293-1.293v4.398c0,.552-.448,1-1,1s-1-.448-1-1v-4.398l-1.293,1.293c-.391.391-1.023.391-1.414,0s-.391-1.023,0-1.414l1.614-1.614c1.154-1.154,3.032-1.154,4.187,0l1.614,1.614c.391.391.391,1.023,0,1.414Z" />
                                    )}
                                </svg>

                                <p>{avatar ? "Change Avatar" : "Upload Avatar"}</p>

                                {imageLoading && (
                                    <Spinner
                                        size={18}
                                        stroke="var(--fg-1)"
                                    />
                                )}
                            </button>

                            {avatar && avatar === user.avatar && (
                                <button
                                    type="button"
                                    title="Remove Avatar"
                                    onClick={() => setAvatar(null)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        height="16"
                                        width="16"
                                    >
                                        <path d="M17,4V2a2,2,0,0,0-2-2H9A2,2,0,0,0,7,2V4H2V6H4V21a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V6h2V4ZM11,17H9V11h2Zm4,0H13V11h2ZM15,4H9V2h6Z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
