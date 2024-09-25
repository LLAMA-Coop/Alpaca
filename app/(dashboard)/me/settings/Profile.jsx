"use client";

import { Form, Input, Spinner } from "@/app/components/client";
import { useUploadThing } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import styles from "./Settings.module.css";
import { useAlerts } from "@/store/store";
import { useRef, useState } from "react";
import Image from "next/image";
import { FormButtons } from "@/app/components/Form/Form";

const cdn = process.env.NEXT_PUBLIC_CDN_URL;

export function Profile({ user }) {
    const [avatar, setAvatar] = useState(user.avatar);
    const [username, setUsername] = useState(user.username);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [description, setDescription] = useState(user.description);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailCode, setEmailCode] = useState("");
    const [errors, setErrors] = useState({});
    const [imageLoading, setImageLoading] = useState(false);

    const addAlert = useAlerts((state) => state.addAlert);
    const router = useRouter();

    const { startUpload } = useUploadThing("avatarOrIcon", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];

            if (!fileId) {
                throw new Error("No file ID returned from cdn.");
            }

            setImageLoading(false);
            handleSubmit(undefined, fileId);
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
        setAvatar(user.avatar);
        setUsername(user.username);
        setDisplayName(user.displayName);
        setDescription(user.description);
        setEmail(user.email);
        setPassword("");
        setNewPassword("");
        setErrors({});
    }

    const avatarInput = useRef(null);
    const hasChanged =
        avatar !== user.avatar ||
        username !== user.username ||
        displayName !== user.displayName ||
        description !== user.description ||
        email !== user.email ||
        newPassword;

    async function handleSubmit(e, fileId) {
        if (e) e.preventDefault();
        if (isLoading || (imageLoading && !fileId)) return;

        const newErrors = {};

        if (username !== user.username && (username.length < 2 || username.length > 32)) {
            newErrors.username = "Must be between 2 and 32 characters.";
        }

        if ((newPassword && newPassword.length < 8) || newPassword.length > 72) {
            newErrors.newPassword = "Must be between 8 and 72 characters.";
        }

        if (newPassword && !password) {
            newErrors.password = "You must enter your current password.";
        }

        if (
            displayName !== user.displayName &&
            (displayName.length < 2 || displayName.length > 32)
        ) {
            newErrors.displayName = "Must be between 2 and 32 characters.";
        }

        if (email !== user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email address.";
        }

        if (description !== user.description && description.length > 256) {
            newErrors.description = "Description must be less than 256 characters.";
        }

        if (Object.keys(newErrors).length) {
            return setErrors(newErrors);
        }

        try {
            setIsLoading(true);

            if (avatar && avatar !== user.avatar && !fileId) {
                return startUpload([avatar]);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    avatar: avatar !== user.avatar ? fileId || null : undefined,
                    username: user.username !== username ? username : undefined,
                    newPassword: newPassword || undefined,
                    password: newPassword ? password : undefined,
                    displayName: user.displayName !== displayName ? displayName : undefined,
                    description: user.description !== description ? description : undefined,
                    email: user.email !== email ? email : undefined,
                }),
            });

            let data = null;
            try {
                data = await response.json();
            } catch (err) {}

            if (!response.ok) {
                if (data.errors) {
                    if (data.errors.password) {
                        setErrors((prev) => ({
                            ...prev,
                            newPassword: data.errors.password,
                            password: "",
                        }));
                    } else {
                        setErrors(data.errors);
                    }
                }
            } else {
                router.refresh();

                user = {
                    ...user,
                    avatar: fileId ?? (avatar === null ? avatar : user.avatar),
                    username: username || user.username,
                    displayName: displayName || user.displayName,
                    description: description || user.description,
                    email: email || user.email,
                };

                resetState();
            }

            if (!data.errors) {
                addAlert({
                    success: response.ok,
                    message: data.message || "Something went wrong.",
                });
            }
        } catch (err) {
            console.error(err);

            addAlert({
                success: false,
                message: "Something went wrong.",
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
                    onSubmit={handleSubmit}
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
                        type="password"
                        label="New Password"
                        value={newPassword}
                        placeholder="New Password"
                        error={errors.newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, newPassword: "" }));
                        }}
                    />

                    <Input
                        type="password"
                        value={password}
                        error={errors.password}
                        label="Current Password"
                        placeholder="Current Password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, password: "" }));
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
                        type="email"
                        label="Email"
                        value={email || ""}
                        placeholder="Email"
                        error={errors.email}
                        labelChip={user.emailVerified ? "Verified" : "Unverified"}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, email: "" }));
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
                                {isLoading && <Spinner primary />}
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
                                        size={16}
                                        margin={0}
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
