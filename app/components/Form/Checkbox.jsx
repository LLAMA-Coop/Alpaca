"use client";

import styles from "./Input.module.css";
import { Input } from "./Input";

export function Checkbox({ ...props }) {
    return (
        <Input
            {...props}
            checkbox
        />
    );
}

export function CheckboxElement({ id, label, value, close, loading, props }) {
    return (
        <label
            tabIndex={0}
            htmlFor={id}
            className={styles.checkbox}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    props.onChange(!value);
                }
            }}
            style={{
                gap: close ? "24px" : "",
                width: close ? "fit-content" : "",
                justifyContent: close ? "flex-start" : "",
            }}
        >
            <span>{label}</span>

            <div className={`${styles.checker} ${value ? styles.checked : ""}`}>
                <div>
                    {loading ? (
                        <div className={styles.spinner} />
                    ) : value ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 507.506 507.506"
                            fill="currentColor"
                            height="12"
                            width="12"
                            x="0px"
                            y="0px"
                        >
                            <g>
                                <path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z" />
                            </g>
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            height="18"
                            width="18"
                        >
                            <path d="M14.121,12,18,8.117A1.5,1.5,0,0,0,15.883,6L12,9.879,8.11,5.988A1.5,1.5,0,1,0,5.988,8.11L9.879,12,6,15.882A1.5,1.5,0,1,0,8.118,18L12,14.121,15.878,18A1.5,1.5,0,0,0,18,15.878Z" />
                        </svg>
                    )}
                </div>
            </div>

            <input
                id={id}
                tabIndex={-1}
                type="checkbox"
                checked={value}
                onChange={(e) => props.onChange(e.target.checked)}
            />
        </label>
    );
}
