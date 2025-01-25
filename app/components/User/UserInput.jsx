"use client";

import { TooltipContent, TooltipTrigger, Tooltip, Spinner, Input, Form, InfoBox } from "@client";
import { useRouter } from "next/navigation";
import { Validator } from "@/lib/validation";
import { useEffect, useState } from "react";
import styles from "./UserInput.module.css";
import { useAlerts } from "@/store/store";
import Link from "next/link";

export function UserInput({ isRegistering, onSubmit }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [showTwoFactor, setShowTwoFactor] = useState(true);
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const addAlert = useAlerts((state) => state.addAlert);
    const router = useRouter();

    useEffect(() => {
        if (twoFactorToken && showTwoFactor && twoFactorCode.length === 6) {
            handleTwoFactor({ preventDefault: () => {} });
        } else if (twoFactorToken && !showTwoFactor && twoFactorCode.length === 11) {
            handleTwoFactor({ preventDefault: () => {} });
        }
    }, [twoFactorCode, showTwoFactor, twoFactorToken]);

    async function handleRegister(e) {
        e.preventDefault();

        const validator = new Validator();
        const name = username.trim();

        validator.validateAll([
            {
                field: "username",
                value: name,
                type: "user",
            },
            {
                field: "password",
                value: password,
                type: "user",
            },
        ]);

        if (!validator.isValid || password !== confirm) {
            return setErrors({
                ...validator.errors,
                confirm: password !== confirm ? "Passwords do not match" : "",
            });
        }

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: name,
                    password,
                }),
            }
        );

        setLoading(false);

        if (response.status === 201) {
            setUsername("");
            setPassword("");
            setConfirm("");
            setErrors({});

            addAlert({
                success: true,
                message: "Successfully registered",
            });

            if (!onSubmit) {
                router.push("/login");
            } else {
                onSubmit();
            }
        } else {
            const data = await response.json();
            setErrors(data.errors || {});

            if (data.errors?.server) {
                addAlert({
                    success: false,
                    message: data.errors.server,
                });
            }
        }
    }

    async function handleLogin(e) {
        e.preventDefault();

        if (username.length === 0 || password.length === 0) {
            return;
        }

        setLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        setLoading(false);

        if (response.status === 200) {
            const data = await response.json();

            if (response.status === 200 && data.code) {
                return setTwoFactorToken(data.code);
            }

            setUsername("");
            setPassword("");
            setErrors({});

            addAlert({
                success: true,
                message: "Successfully logged in",
            });

            if (!onSubmit) window.location.reload();
            else onSubmit();
        } else {
            const data = await response.json();
            setErrors(data.errors || {});

            if (errors.server) {
                addAlert({
                    success: false,
                    message: errors.server,
                });
            }
        }
    }

    async function handleTwoFactor(e) {
        e.preventDefault();
        if (loading) return;

        if (showTwoFactor && twoFactorCode.length !== 6) {
            return setErrors({ code: "Invalid code" });
        }

        if (!showTwoFactor && twoFactorCode.length !== 11) {
            return setErrors({ code: "Invalid recovery code" });
        }

        setLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/auth/2fa`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: twoFactorToken,
                code: showTwoFactor ? twoFactorCode : undefined,
                recovery: !showTwoFactor ? twoFactorCode : undefined,
            }),
        });

        setLoading(false);

        if (response.status === 200) {
            setUsername("");
            setPassword("");
            setErrors({});

            addAlert({
                success: true,
                message: `Successfully logged in${
                    !showTwoFactor ? " - this code is no longer valid" : ""
                }`,
            });

            if (!onSubmit) window.location.reload();
            else onSubmit();
        } else {
            const data = await response.json();
            setErrors(data.errors || {});

            if (errors.server) {
                addAlert({
                    success: false,
                    message: errors.server,
                });
            }
        }
    }

    const expectations = [
        {
            name: "Between 8 and 72 characters",
            regex: /^.{8,72}$/,
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

    if (twoFactorToken) {
        return (
            <Form onSubmit={handleTwoFactor}>
                <InfoBox fullWidth>
                    {showTwoFactor ? (
                        <span>
                            You have two factor authentication enabled.
                            <br />
                            Please enter the code from your authenticator app.
                        </span>
                    ) : (
                        <span>
                            Lost your authenticator app? Enter a recovery code to login.
                            <br />
                            Once used, this code is no longer valid.
                        </span>
                    )}
                </InfoBox>

                {showTwoFactor ? (
                    <Input
                        required
                        autoFocus
                        maxLength={6}
                        error={errors.code}
                        value={twoFactorCode}
                        label="Two Factor Code"
                        placeholder="Two Factor Code"
                        onChange={(e) => {
                            setTwoFactorCode(e.target.value);
                            setErrors({ ...errors, code: "" });
                        }}
                    />
                ) : (
                    <Input
                        required
                        autoFocus
                        maxLength={11}
                        error={errors.code}
                        value={twoFactorCode}
                        label="Recovery Code"
                        placeholder="Recovery Code"
                        onChange={(e) => {
                            setTwoFactorCode(e.target.value);
                            setErrors({ ...errors, code: "" });
                        }}
                    />
                )}

                <button
                    type="button"
                    className={styles.recoveryButton}
                    onClick={() => {
                        setShowTwoFactor((show) => !show);
                    }}
                >
                    I {!!showTwoFactor && "don't"} have my authenticator app
                </button>

                {(!!errors.server || !!errors.token) && (
                    <InfoBox type="danger">{errors.server || errors.token}</InfoBox>
                )}

                <button
                    type="submit"
                    className="button submit primary"
                >
                    Submit {loading && <Spinner primary />}
                </button>
            </Form>
        );
    }

    return (
        <Form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <Input
                required
                autoFocus
                label="Username"
                value={username}
                placeholder="Username"
                error={errors.username}
                onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((errors) => ({ ...errors, username: "" }));
                }}
            />

            <Tooltip placement="right">
                <TooltipTrigger>
                    <div>
                        <Input
                            required
                            type="password"
                            label="Password"
                            value={password}
                            placeholder="Password"
                            error={errors.password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((errors) => ({
                                    ...errors,
                                    password: "",
                                    username: isRegistering ? errors.username : "",
                                }));
                            }}
                        />
                    </div>
                </TooltipTrigger>

                {isRegistering && (
                    <TooltipContent noStyle>
                        <div className={styles.expectations}>
                            <p>Your password must meet the following expectations:</p>

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
                )}
            </Tooltip>

            {isRegistering && (
                <InfoBox
                    asDiv
                    fullWidth
                    className={styles.hideBox}
                >
                    <div className={styles.expectationsBox}>
                        <p>Your password must meet the following expectations:</p>

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
            )}

            {isRegistering && (
                <Input
                    required
                    type="password"
                    value={confirm}
                    error={errors.confirm}
                    label="Password Match"
                    placeholder="Confirm Password"
                    onChange={(e) => {
                        setConfirm(e.target.value);
                        setErrors({ ...errors, confirm: "" });
                    }}
                />
            )}

            {!isRegistering && (
                <Link
                    href="/forgot-password"
                    className={`link ${styles.forgotPassword}`}
                >
                    Forgot password?
                </Link>
            )}

            <button
                type="submit"
                className="button submit primary"
            >
                {isRegistering ? "Register" : "Login"} {loading && <Spinner primary />}
            </button>
        </Form>
    );
}
