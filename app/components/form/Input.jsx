"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import makeUniqueId from "@/lib/uniqueId";
import styles from "./Input.module.css";
import { useEffect, useState } from "react";

export function Label({ required, error, errorId, label, htmlFor }) {
    return (
        <div className={styles.labelContainer}>
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
    outlineColor,
}) {
    const [inputId, setInputId] = useState("");
    const [errorId, setErrorId] = useState("");

    useEffect(() => {
        setInputId(`${id ?? label.split("").join("_")}-${makeUniqueId()}`);
        setErrorId(`${inputId}-error`);
    }, []);

    return (
        <div
            className={styles.container}
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
                className={styles.inputContainer}
                style={{ pointerEvents: disabled ? "none" : "" }}
            >
                {type === "select" && choices && (
                    <select
                        id={inputId}
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
                        value={value || ""}
                        minLength={minLength}
                        maxLength={maxLength}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && action) onActionTrigger(e);
                        }}
                        style={{ outlineColor: outlineColor || "" }}
                    >
                        {choices.map((choice) => (
                            <option
                                key={choice.key ?? choice.value}
                                value={choice.value}
                            >
                                {choice.label}
                            </option>
                        ))}
                    </select>
                )}

                {type === "textarea" && (
                    <textarea
                        id={inputId}
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

                {maxLength > 0 && value.length > 0 && (
                    <div>
                        {value.length}/{maxLength}
                    </div>
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
        </div>
    );
}
