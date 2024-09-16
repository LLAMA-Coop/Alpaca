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
    ...props
}) {
    const [hasLoaded, setHasLoaded] = useState(false);
    const id = getNanoId();

    useEffect(() => {
        setHasLoaded(true);
    }, []);

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
                "Input component with multiple requires an array data prop.",
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
                <input
                    tabIndex={-1}
                    className={`${styles.input} ${styles.skeleton}`}
                />
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
                setter={setter}
                options={options}
                multiple={multiple}
                itemValue={itemValue}
                itemLabel={itemLabel}
                notObject={notObject}
                removeItem={removeItem}
                description={description}
            >
                {options.map((option) => (
                    <Option
                        key={getNanoId()}
                        label={notObject ? option : option[itemLabel]}
                        active={
                            multiple
                                ? data.find((t) =>
                                      notObject
                                          ? t === option
                                          : t[itemValue] === option[itemValue],
                                  )
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
                props={props}
            />
        );
    }

    return (
        <div className={styles.container}>
            <label htmlFor={id} className={styles.label}>
                {label}

                {(props.required || error) && (
                    <span className={styles.required}>*</span>
                )}

                {error && (
                    <span id={`${id}-error`} className={styles.error}>
                        {" "}
                        {error}
                    </span>
                )}
            </label>

            <div
                className={`${styles.wrapper} ${multiple ? styles.multiple : ""} ${textarea ? styles.textarea : ""}`}
                style={{
                    borderColor: error ? "var(--danger-50)" : "",
                    "--bs-1": error ? "var(--danger-20)" : "",
                    "--bs-2": error ? "var(--danger-08)" : "",
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
                            {item}

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                height="12"
                                width="12"
                            >
                                <rect
                                    x="6"
                                    y="11"
                                    width="12"
                                    height="2"
                                    rx="1"
                                />
                            </svg>
                        </span>
                    ))}

                {textarea ? (
                    <textarea
                        id={id}
                        {...props}
                        value={value}
                        aria-label={label}
                        className={`${styles.input} ${styles.textarea}`}
                        aria-invalid={error ? "true" : "false"}
                        aria-multiline={multiple ? "true" : "false"}
                        aria-describedby={error ? `${id}-error` : ""}
                        aria-required={props.required ? "true" : "false"}
                    />
                ) : (
                    <input
                        id={id}
                        {...props}
                        value={value}
                        aria-label={label}
                        className={styles.input}
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
                            } else if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();

                                if (data.includes(value)) {
                                    return;
                                }

                                addItem(value);
                            }
                        }}
                    />
                )}
            </div>

            {description && <p className={styles.description}>{description}</p>}
        </div>
    );
}

export function TextArea({ ...props }) {
    return <Input {...props} textarea />;
}
