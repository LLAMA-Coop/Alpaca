"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import makeUniqueId from "@/lib/uniqueId";
import styles from "./Input.module.css";
import { useEffect, useRef, useState } from "react";

export function Label({ required, error, errorId, label, htmlFor, checkbox }) {
    return (
        <div
            className={`${styles.labelContainer} ${checkbox && styles.normal}`}
        >
            <label htmlFor={htmlFor}>
                {label} {required && <span>*</span>}
            </label>

            {error && (
                <span id={errorId} aria-live="polite">
                    {error}
                </span>
            )}
        </div>
    );
}

export function Input({
    id,
    type,
    description,
    autoComplete,
    choices,
    required,
    onChange,
    value,
    minLength,
    maxLength,
    error,
    label,
    onFocus,
    onBlur,
    action,
    onActionTrigger,
    disabled,
    autoFocus,
    outlineColor,
    inline,
}) {
    const [inputId, setInputId] = useState("");
    const [errorId, setErrorId] = useState("");
    const [open, setOpen] = useState(false);

    const container = useRef(null);
    const firstElement = useRef(null);

    useEffect(() => {
        if (!id || !label) return;
        setInputId(`${id ?? label.split("").join("_")}-${makeUniqueId()}`);
        setErrorId(`${inputId}-error`);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        const handleKeyDown = (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = e.target.nextSibling;
                if (next) next.focus();
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                const prev = e.target.previousSibling;
                if (prev) prev.focus();
            }
        };

        const handleClickOutside = (e) => {
            if (!container.current.contains(e.target)) setOpen(false);
        };

        if (open) {
            firstElement.current.focus();
            document.addEventListener("keydown", handleEscape);
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("click", handleClickOutside);
        };
    }, [open]);

    if (type === "checkbox" && typeof value === "boolean")
        return (
            <div
                className={`${styles.inlineContainer} ${
                    disabled && styles.disabled
                }`}
                onClick={type === "checkbox" && !disabled && onChange}
            >
                {label && (
                    <Label
                        label={label}
                        error={error}
                        errorId={errorId}
                        htmlFor={inputId}
                        required={required}
                        checkbox={true}
                    />
                )}

                <div
                    className={styles.checkbox}
                    style={{
                        backgroundColor: value
                            ? "var(--accent-tertiary-light)"
                            : "var(--background-tertiary)",
                    }}
                >
                    <svg
                        viewBox="0 0 28 20"
                        preserveAspectRatio="xMinYMid meet"
                        aria-hidden="true"
                        style={{ left: value ? "12px" : "-3px" }}
                    >
                        <rect
                            fill="white"
                            x="4"
                            y="0"
                            height="20"
                            width="20"
                            rx="10"
                        />

                        {value ? (
                            <svg viewBox="0 0 20 20" fill="none">
                                <path
                                    fill="rgba(35, 165, 90, 1)"
                                    d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z"
                                />
                                <path
                                    fill="rgba(35, 165, 90, 1)"
                                    d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z"
                                />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 20 20" fill="none">
                                <path
                                    fill="rgba(128, 132, 142, 1)"
                                    d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z"
                                />
                                <path
                                    fill="rgba(128, 132, 142, 1)"
                                    d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"
                                />
                            </svg>
                        )}
                    </svg>

                    <input
                        type="checkbox"
                        id={inputId}
                        autoFocus={autoFocus ? true : false}
                        autoComplete={autoComplete || "off"}
                        aria-describedby={description}
                        aria-required={error ? error : ""}
                        aria-disabled={disabled}
                        aria-invalid={error ? "true" : "false"}
                        aria-errormessage={error ? errorId : ""}
                        required={required}
                        disabled={disabled}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        checked={value}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && action) onActionTrigger(e);
                        }}
                    />
                </div>
            </div>
        );

    return (
        <div
            className={`${styles.container} ${inline ? styles.inline : ""}`}
            style={{
                opacity: disabled ? "0.3" : "",
                cursor: disabled ? "not-allowed" : "",
            }}
        >
            {label && (
                <Label
                    label={label}
                    error={error}
                    errorId={errorId}
                    htmlFor={inputId}
                    required={required}
                />
            )}

            <div
                ref={container}
                className={styles.inputContainer}
                style={{ pointerEvents: disabled ? "none" : "" }}
            >
                {type === "select" && choices && (
                    <select
                        id={inputId}
                        autoFocus={autoFocus ? true : false}
                        autoComplete={autoComplete || "off"}
                        aria-describedby={description}
                        aria-required={error ? error : ""}
                        aria-disabled={disabled}
                        aria-invalid={error ? "true" : "false"}
                        aria-errormessage={error ? errorId : ""}
                        className="thinScroller"
                        required={required}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        value={value || ""}
                        minLength={minLength}
                        maxLength={maxLength}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && action) onActionTrigger(e);
                        }}
                    >
                        {choices.map((choice) => (
                            <option key={choice.key ?? choice.label} value={choice.value}>{choice.label}</option>
                        ))}
                    </select>
                )}

                {type === "textarea" && (
                    <textarea
                        id={inputId}
                        autoFocus={autoFocus ? true : false}
                        autoComplete={autoComplete || "off"}
                        aria-describedby={description}
                        aria-required={error ? error : ""}
                        aria-disabled={disabled}
                        aria-invalid={error ? "true" : "false"}
                        aria-errormessage={error ? errorId : ""}
                        className="thinScroller"
                        required={required}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        value={value || ""}
                        minLength={minLength}
                        maxLength={maxLength}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && action) onActionTrigger(e);
                        }}
                    />
                )}

                {type === "checkbox" && (
                    <input
                        type="checkbox"
                        id={inputId}
                        autoFocus={autoFocus ? true : false}
                        autoComplete={autoComplete || "off"}
                        aria-describedby={description}
                        aria-required={error ? error : ""}
                        aria-disabled={disabled}
                        aria-invalid={error ? "true" : "false"}
                        aria-errormessage={error ? errorId : ""}
                        required={required}
                        disabled={disabled}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        checked={
                            value === "on" || value === true ? true : false
                        }
                        minLength={minLength}
                        maxLength={maxLength}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && action) onActionTrigger(e);
                        }}
                    />
                )}

                {!["select", "checkbox", "textarea"].includes(type) && (
                    <input
                        id={inputId}
                        autoFocus={autoFocus ? true : false}
                        autoComplete={autoComplete || "off"}
                        aria-describedby={description}
                        aria-required={error ? error : ""}
                        aria-disabled={disabled}
                        aria-invalid={error ? "true" : "false"}
                        aria-errormessage={error ? errorId : ""}
                        type={type || "text"}
                        required={required}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        value={value || ""}
                        minLength={minLength}
                        maxLength={maxLength}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && onActionTrigger) {
                                onActionTrigger(e);
                            }
                        }}
                        style={{
                            paddingRight: action ? "44px" : "",
                            outlineColor: outlineColor || "",
                        }}
                    />
                )}

                {action && (
                    <button
                        type="button"
                        title={action}
                        tabIndex={-1}
                        className={styles.actionButton}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onActionTrigger(e);
                        }}
                    >
                        <FontAwesomeIcon icon={faAdd} />
                    </button>
                )}
            </div>

            {maxLength > 0 && (
                <div className={styles.count}>
                    {value.length}/{maxLength}
                </div>
            )}
        </div>
    );
}
