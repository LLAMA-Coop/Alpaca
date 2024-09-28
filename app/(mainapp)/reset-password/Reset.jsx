"use client";

import { InfoBox, Input, Spinner, Tooltip, TooltipContent, TooltipTrigger } from "@client";
import { Validator } from "@/lib/validation";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import { useState } from "react";

export function Reset({ token }) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState({});

    const router = useRouter();

    async function handleResetPassword(e) {
        e.preventDefault();
        if (loading) return;

        const validator = new Validator();

        if (!password) {
            return setErrors((prev) => ({ ...prev, password: "Password is required" }));
        }

        if (
            !validator.validate({
                field: "password",
                value: password,
                type: "user",
            })
        ) {
            return setErrors((prev) => ({ ...prev, password: "Invalid password format" }));
        }

        if (password !== confirm) {
            return setErrors((prev) => ({ ...prev, confirm: "Passwords do not match" }));
        }

        try {
            setLoading(true);
            setErrors({});

            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, resetToken: token }),
            });

            if (!res.ok) {
                const { message } = await res.json();
                throw new Error(message);
            }

            // Redirect to login
            router.push("/login");
        } catch (error) {
            setErrors({ password: error.message });
        } finally {
            setLoading(false);
        }
    }

    const expectations = [
        {
            name: "At least 8 characters",
            regex: /.{8,}/,
        },
        {
            name: "At least 1 uppercase letter",
            regex: /[A-Z]/,
        },
        {
            name: "At least 1 lowercase letter",
            regex: /[a-z]/,
        },
        {
            name: "At least 1 number",
            regex: /\d/,
        },
        {
            name: "At least 1 special character",
            regex: /[^A-Za-z0-9]/,
        },
    ];

    return (
        <form
            className={styles.forgotForm}
            onSubmit={handleResetPassword}
        >
            <Tooltip placement="right">
                <TooltipTrigger>
                    <div>
                        <Input
                            required
                            type="password"
                            name="password"
                            value={password}
                            label="New Password"
                            error={errors.password}
                            placeholder="Enter your new password"
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((prev) => ({ ...prev, password: "" }));
                            }}
                        />
                    </div>
                </TooltipTrigger>

                <TooltipContent noStyle>
                    <div className={styles.expectations}>
                        <p>Your password must contain:</p>

                        <ul>
                            {expectations.map((exp) => {
                                return (
                                    <li
                                        key={exp.name}
                                        className={exp.regex.test(password) ? styles.valid : ""}
                                    >
                                        {exp.regex.test(password) && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 507.506 507.506"
                                                fill="currentColor"
                                                x="0px"
                                                y="0px"
                                            >
                                                <g>
                                                    <path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z" />
                                                </g>
                                            </svg>
                                        )}

                                        <span>{exp.name}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </TooltipContent>
            </Tooltip>

            <InfoBox
                asDiv
                fullWidth
                className={styles.hideBox}
            >
                <div className={styles.expectationsBox}>
                    <p>Your password must contain:</p>

                    <ul>
                        {expectations.map((exp) => {
                            return (
                                <li
                                    key={exp.name}
                                    className={exp.regex.test(password) ? styles.valid : ""}
                                >
                                    {exp.regex.test(password) && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 507.506 507.506"
                                            fill="currentColor"
                                            x="0px"
                                            y="0px"
                                        >
                                            <g>
                                                <path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z" />
                                            </g>
                                        </svg>
                                    )}

                                    <span>{exp.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </InfoBox>

            <Input
                required
                name="confirm"
                type="password"
                value={confirm}
                error={errors.confirm}
                label="Confirm Password"
                placeholder="Confirm your new password"
                onChange={(e) => {
                    setConfirm(e.target.value);
                    setErrors((prev) => ({ ...prev, confirm: "" }));
                }}
            />

            {/* {waiting !== false && (
                        <InfoBox>
                            An email has been sent to you with a link to reset your password. Please
                            check your inbox and spam folder. If you do not receive an email within
                            5 minutes, please try again.
                        </InfoBox>
                    )} */}

            <button
                type="submit"
                disabled={loading}
                className="button submit primary"
            >
                Reset Password {loading && <Spinner primary />}
            </button>
        </form>
    );
}
