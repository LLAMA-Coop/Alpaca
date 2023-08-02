"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import styles from "./Input.module.css";

export function Label({ required, error, label, htmlFor }) {
  return (
    <div className={styles.labelContainer}>
      <label htmlFor={htmlFor}>
        {label} {required && <span>*</span>}
      </label>
      {error && <span>{error}</span>}
    </div>
  );
}

export function Input({
  id,
  type,
  choices,
  required,
  onChange,
  value,
  error,
  label,
  onFocus,
  onBlur,
  onSubmit,
  onKeyUp,
  onEnter,
  disabled,
  outlineColor,
}) {
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
          required={required}
          error={error}
          label={label}
          htmlFor={id ?? label}
        />
      )}

      <div
        className={styles.inputContainer}
        style={{
          pointerEvents: disabled ? "none" : "",
        }}
      >
        {type === "select" && choices ? (
          <select
            required={required}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            value={value || ""}
            style={{
              outlineColor: outlineColor || "",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSubmit) onSubmit(e);
              if (e.key === "Enter" && onEnter) onEnter(e);
            }}
          >
            {choices.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id ?? label}
            type={type || "text"}
            required={required}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            value={value || ""}
            style={{
              paddingRight: onSubmit ? "44px" : "",
              outlineColor: outlineColor || "",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSubmit) onSubmit(e);
              if (e.key === "Enter" && onEnter) onEnter(e);
            }}
          />
        )}

        {onSubmit && (
          <button
            className={styles.actionButton}
            onClick={(e) => onSubmit(e)}
            title={label}
          >
            <FontAwesomeIcon icon={faAdd} />
          </button>
        )}
      </div>
    </div>
  );
}

export function TextArea({
  id,
  required,
  onChange,
  value,
  error,
  label,
  onFocus,
  onBlur,
}) {
  return (
    <div className={styles.container}>
      {label && (
        <Label
          required={required}
          error={error}
          htmlFor={id ?? label}
          label={label}
        />
      )}

      <div className={styles.inputContainer}>
        <textarea
          id={id ?? label}
          className="thinScroller"
          required={required}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          value={value || ""}
        />
      </div>
    </div>
  );
}
