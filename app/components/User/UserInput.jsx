"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip";
import { Validator } from "@/lib/validation";
import styles from "./UserInput.module.css";
import { useRouter } from "next/navigation";
import { useAlerts } from "@/store/store";
import { Input, Spinner } from "@client";
import { useState } from "react";

export function UserInput({ isRegistering, onSubmit }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [open, setOpen] = useState(false);

    const addAlert = useAlerts((state) => state.addAlert);
    const router = useRouter();

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
            },
        );

        setLoading(false);

        if (response.status === 201) {
            setUsername("");
            setPassword("");
            setConfirm("");
            setErrors({});

            addAlert({
                success: true,
                message: "Successfully registered.",
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

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            },
        );

        setLoading(false);

        if (response.status === 200) {
            setUsername("");
            setPassword("");
            setErrors({});

            addAlert({
                success: true,
                message: "Successfully logged in.",
            });

            if (!onSubmit) {
                const redirectUrl = new URLSearchParams(
                    window.location.search,
                ).get("redirect");

                if (redirectUrl) {
                    router.push(redirectUrl);
                } else {
                    router.push(`/users/${username}`);
                }
            } else {
                onSubmit();
            }

            router.refresh();
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
        <form className="formGrid">
            <Input
                required
                autoFocus
                label="Username"
                value={username}
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
                            error={errors.password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((errors) => ({
                                    ...errors,
                                    password: "",
                                    username: isRegistering
                                        ? errors.username
                                        : "",
                                }));
                            }}
                        />
                    </div>
                </TooltipTrigger>

                <TooltipContent>
                    {isRegistering && (
                        <div className={styles.expectations}>
                            <p>Your password must contain:</p>

                            <ul>
                                {expectations.map((exp) => {
                                    return (
                                        <li
                                            key={exp.name}
                                            className={
                                                exp.regex.test(password)
                                                    ? styles.valid
                                                    : ""
                                            }
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
                    )}
                </TooltipContent>
            </Tooltip>

            {isRegistering && (
                <Input
                    required
                    type="password"
                    value={confirm}
                    error={errors.confirm}
                    label="Password Match"
                    onChange={(e) => {
                        setConfirm(e.target.value);
                        setErrors({ ...errors, confirm: "" });
                    }}
                />
            )}

            <button
                onClick={isRegistering ? handleRegister : handleLogin}
                className="button submit primary"
            >
                {loading ? <Spinner /> : isRegistering ? "Register" : "Login"}
            </button>
        </form>
    );
}
