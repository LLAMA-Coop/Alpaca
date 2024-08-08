"use client";

import { useEffect, useRef, useState } from "react";
import { useModals } from "@/store/store";
import styles from "./Modals.module.css";
import { Input } from "@client";

export function Modals() {
    const modals = useModals((state) => state.modals);

    useEffect(() => {
        if (modals.length === 0) {
            document.documentElement.style.overflow = "auto";
        } else {
            document.documentElement.style.overflow = "hidden";
        }
    }, [modals]);

    if (modals.length === 0) return null;

    return (
        <div className={styles.container} data-find="modals">
            {modals.map((modal, index) => (
                <Modal
                    key={modal.id}
                    modal={modal}
                    index={index}
                    length={modals.length}
                />
            ))}
        </div>
    );
}

export function Modal({ modal, index, length, buttonTexts }) {
    const [closing, setClosing] = useState(false);
    const [password, setPassword] = useState("");

    const [reportTitle, setReportTitle] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [reportUrl, setReportUrl] = useState(
        typeof window !== "undefined" ? window.location.href : "",
    );

    const removeModal = useModals((state) => state.removeModal);
    const closeButton = useRef(null);
    const saveButton = useRef(null);

    useEffect(() => {
        const active = document.activeElement;
        if (active) active.blur();

        function handleKeyDown(e) {
            if (e.key === "Tab") {
                if (e.shiftKey) {
                    if (document.activeElement === closeButton.current) {
                        e.preventDefault();
                        saveButton.current.focus();
                    }
                } else if (!document.activeElement) {
                    e.preventDefault();
                    closeButton.current.focus();
                }
            } else if (e.key === "Escape") {
                close();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    function close() {
        setClosing(true);
        setTimeout(() => {
            removeModal(modal.id);
        }, 200);
    }

    return (
        <div
            className={styles.wrapper}
            onClick={() => close()}
            style={{
                backgroundColor: index === 0 ? "rgba(0, 0, 0, 0.5)" : "",
                animation:
                    index === 0
                        ? closing
                            ? `${styles.fadeOut} 0.25s ease`
                            : `${styles.fadeIn} 0.2s ease`
                        : "",
            }}
        >
            <div
                aria-modal="true"
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                style={{
                    animationName:
                        closing || index < length - 1
                            ? `${styles.fadeOut}, ${styles.popOut}`
                            : "",
                }}
            >
                <header>
                    <h2>{modal.title || "Modal Title"}</h2>

                    <button ref={closeButton} onClick={() => close()}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path d="M18 6l-12 12" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className={styles.content}>
                    {modal.content === "Confirm Password" ? (
                        <div>
                            <p style={{ marginBottom: "24px" }}>
                                These changes require you to confirm your
                                current password.
                            </p>

                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    ) : modal.content === "Report a bug" ? (
                        <div>
                            <p style={{ marginBottom: "24px" }}>
                                Please describe the bug you encountered below.
                                If you can, please include steps to reproduce
                                the bug.
                            </p>

                            <Input
                                label="Title"
                                value={reportTitle}
                                maxLength={128}
                                onChange={(e) => setReportTitle(e.target.value)}
                            />

                            <Input
                                label="Description"
                                value={reportDescription}
                                maxLength={4096}
                                onChange={(e) => {
                                    setReportDescription(e.target.value);
                                    setDescriptionError("");
                                }}
                                type="textarea"
                                error={descriptionError}
                            />

                            <Input
                                label="URL"
                                value={reportUrl}
                                maxLength={256}
                                onChange={(e) => setReportUrl(e.target.value)}
                            />
                        </div>
                    ) : (
                        modal.content
                    )}
                </div>

                <footer>
                    <button
                        className="button transparent"
                        onClick={() => close()}
                    >
                        {modal.buttonTexts ? modal.buttonTexts[0] : "Cancel"}
                    </button>

                    <button
                        ref={saveButton}
                        className={`button ${
                            modal.isActionDangerous ? "red" : ""
                        }`}
                        onClick={() => {
                            if (modal.onSave) {
                                if (modal.content === "Confirm Password") {
                                    modal.onSave(password);
                                } else if (modal.content === "Report a bug") {
                                    if (reportDescription.length < 10) {
                                        setDescriptionError(
                                            "Description must be at least 10 characters long.",
                                        );
                                        return;
                                    }
                                    modal.onSave({
                                        title: reportTitle,
                                        description: reportDescription,
                                        url: reportUrl,
                                    });
                                } else {
                                    modal.onSave();
                                }
                            }
                            close();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Tab" && !e.shiftKey) {
                                e.preventDefault();
                                closeButton.current.focus();
                            }
                        }}
                    >
                        {modal.buttonTexts ? modal.buttonTexts[1] : "Save"}
                    </button>
                </footer>
            </div>
        </div>
    );
}
