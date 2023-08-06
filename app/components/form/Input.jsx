"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import makeUniqueId from "@/app/code/uniqueId";
import styles from "./Input.module.css";

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
    const inputId = `${label}-${makeUniqueId()}`;
    const errorId = `${inputId}-error`;

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
                {type === "select" && choices ? (
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
                            <option key={choice.value} value={choice.value}>
                                {choice.label}
                            </option>
                        ))}
                    </select>
                ) : type === "textarea" ? (
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
                ) : (
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
