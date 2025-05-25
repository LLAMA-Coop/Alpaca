"use client";

import { Option, SelectElement } from "./Select";
import { CheckboxElement } from "./Checkbox";
import { useEffect, useState } from "react";
import { getNanoId } from "@/lib/random";
import styles from "./Input.module.css";

export function Input({
  label,
  value,
  data,
  removeItem,
  addItem,
  multiple,
  select,
  textarea,
  checkbox,
  options,
  error,
  description,
  skeleton,
  itemValue = "value",
  itemLabel = "label",
  notObject,
  setter,
  small,
  inline,
  hideLabel,
  labelChip,
  success,
  width,
  darker,
  loading,
  close,
  onIdChange,
  ...props
}) {
  const [revealPassword, setRevealPassword] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const id = getNanoId();

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (onIdChange) {
      onIdChange(id);
    }
  }, [id]);

  if (props.type === "textarea") {
    textarea = true;
  } else if (props.type === "checkbox") {
    checkbox = true;
  } else if (props.type === "select") {
    select = true;
  }

  if (!skeleton) {
    // Deal with user errors

    if (!label) {
      throw new Error("Input component requires a label prop.");
    }

    if (multiple && !Array.isArray(data)) {
      throw new Error(
        "Input component with multiple requires an array data prop."
      );
    }

    if (select && !Array.isArray(options)) {
      throw new Error("Select component requires an array options prop.");
    }
  }

  if (!hasLoaded || skeleton) {
    return (
      <div className={styles.container}>
        <label className={`${styles.label} ${styles.skeleton}`} />
        <input tabIndex={-1} className={`${styles.input} ${styles.skeleton}`} />
      </div>
    );
  }

  if (select) {
    return (
      <SelectElement
        id={id}
        data={data}
        value={value}
        props={props}
        label={label}
        error={error}
        darker={darker}
        setter={setter}
        success={success}
        options={options}
        multiple={multiple}
        itemValue={itemValue}
        itemLabel={itemLabel}
        notObject={notObject}
        removeItem={removeItem}
        description={description}
        disabled={props.disabled}
      >
        {options.map((option) => (
          <Option
            key={getNanoId()}
            label={notObject ? option : option[itemLabel]}
            active={
              multiple
                ? data.find((t) => {
                    if (!t) return false;
                    return notObject
                      ? t === option
                      : t[itemValue] === option[itemValue];
                  })
                : false
            }
            multiple={multiple}
          />
        ))}

        {options.length === 0 && (
          <div className={`${styles.option} ${styles.empty}`}>
            No options available
          </div>
        )}
      </SelectElement>
    );
  } else if (checkbox) {
    return (
      <CheckboxElement
        id={id}
        label={label}
        value={value}
        close={close}
        props={props}
        loading={loading}
      />
    );
  }

  return (
    <div
      className={styles.container}
      style={{
        display: inline ? "inline-block" : "",
        opacity: success ? 0.8 : "",
      }}
    >
      <label
        htmlFor={id}
        style={{
          visibility: hideLabel ? "hidden" : "",
          position: hideLabel ? "absolute" : "",
          top: hideLabel ? "-9999px" : "",
        }}
        className={styles.label}
      >
        {label}

        {!!labelChip && labelChip}

        {(props.required || error) && (
          <span className={styles.required}>*</span>
        )}

        {error && (
          <span id={`${id}-error`} className={styles.error}>
            {" "}
            {error}
          </span>
        )}

        {success && <span className={styles.success}>{success}</span>}
      </label>

      <div
        className={`${styles.wrapper} ${multiple ? styles.multiple : ""} ${
          textarea ? styles.textarea : ""
        }`}
        style={{
          borderColor: error
            ? "var(--danger-50)"
            : success
              ? "var(--success-50)"
              : "",
          "--bs-1": error
            ? "var(--danger-20)"
            : success
              ? "var(--success-20)"
              : "",
          "--bs-2": error
            ? "var(--danger-08)"
            : success
              ? "var(--success-08)"
              : "",
          height: inline ? "20px" : small ? "32px" : "",
          width: inline || small ? "fit-content" : "",
        }}
      >
        {multiple &&
          !!data.length &&
          data.map((item) => (
            <span
              key={getNanoId()}
              className={styles.chip}
              onClick={() => removeItem && removeItem(item)}
            >
              <span>{item}</span>

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                height="12"
                width="12"
              >
                <rect x="6" y="11" width="12" height="2" rx="1" />
              </svg>
            </span>
          ))}

        {textarea ? (
          <textarea
            id={id}
            {...props}
            value={value}
            aria-label={label}
            aria-invalid={error ? "true" : "false"}
            aria-multiline={multiple ? "true" : "false"}
            aria-describedby={error ? `${id}-error` : ""}
            className={`${styles.input} ${styles.textarea}`}
            aria-required={props.required ? "true" : "false"}
            style={{ backgroundColor: darker ? "var(--bg-1)" : "" }}
          />
        ) : (
          <input
            id={id}
            {...props}
            value={value}
            aria-label={label}
            className={styles.input}
            type={
              props.type === "password" && revealPassword ? "text" : props.type
            }
            style={{
              backgroundColor: darker ? "var(--bg-1)" : "",
              padding: inline ? "0 2px" : small ? "0 6px" : "",
              fontSize: inline || small ? "14px" : "",
              width: width ? width : inline || small ? "fit-content" : "",
              fontFamily: inline ? "var(--font-mono)" : "",
              minWidth: inline ? "28px" : "",
              color: inline ? "var(--fg-1)" : "",
              paddingRight: inline
                ? "2px"
                : props.type === "password"
                  ? "50px"
                  : "",
            }}
            aria-invalid={error ? "true" : "false"}
            aria-multiline={multiple ? "true" : "false"}
            aria-describedby={error ? `${id}-error` : ""}
            aria-required={props.required ? "true" : "false"}
            onKeyDown={(e) => {
              if (!multiple || !removeItem || !addItem) {
                return;
              }

              if (e.key === "Backspace" && value === "") {
                removeItem(data[data.length - 1]);
                setCharCount(0);
              } else if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();

                if (data.includes(value)) {
                  return;
                }

                addItem(value);
                setCharCount(0);
              }

              setCharCount(value.length);
            }}
          />
        )}

        {props.type === "password" && (
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealPassword((prev) => !prev)}
          >
            {revealPassword ? (
              <svg viewBox="0 0 24 24">
                <path d="M23.821,11.181v0C22.943,9.261,19.5,3,12,3S1.057,9.261.179,11.181a1.969,1.969,0,0,0,0,1.64C1.057,14.739,4.5,21,12,21s10.943-6.261,11.821-8.181A1.968,1.968,0,0,0,23.821,11.181ZM12,18a6,6,0,1,1,6-6A6.006,6.006,0,0,1,12,18Z" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path d="M23.821,11.181v0a15.736,15.736,0,0,0-4.145-5.44l3.032-3.032L21.293,1.293,18,4.583A11.783,11.783,0,0,0,12,3C4.5,3,1.057,9.261.179,11.181a1.969,1.969,0,0,0,0,1.64,15.736,15.736,0,0,0,4.145,5.44L1.293,21.293l1.414,1.414L6,19.417A11.783,11.783,0,0,0,12,21c7.5,0,10.943-6.261,11.821-8.181A1.968,1.968,0,0,0,23.821,11.181ZM6,12a5.99,5.99,0,0,1,9.471-4.885L14.019,8.567A3.947,3.947,0,0,0,12,8a4,4,0,0,0-4,4,3.947,3.947,0,0,0,.567,2.019L7.115,15.471A5.961,5.961,0,0,1,6,12Zm6,6a5.961,5.961,0,0,1-3.471-1.115l1.452-1.452A3.947,3.947,0,0,0,12,16a4,4,0,0,0,4-4,3.947,3.947,0,0,0-.567-2.019l1.452-1.452A5.99,5.99,0,0,1,12,18Z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

export function TextArea({ ...props }) {
  return <Input {...props} textarea />;
}

export function Label({ id, error, ...props }) {
  return (
    <label htmlFor={id} className={styles.label}>
      {props.children}

      {(props.required || error) && <span className={styles.required}>*</span>}

      {error && (
        <span id={`${id}-error`} className={styles.error}>
          {" "}
          {error}
        </span>
      )}
    </label>
  );
}
