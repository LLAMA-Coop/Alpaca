"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Input, Alert, Spinner } from "@components/client";
import { useState, useRef, useEffect } from "react";
import styles from "./UserInput.module.css";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";

export function UserInput({ isRegistering }) {
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    const [passwordFocus, setPasswordFocus] = useState(false);

    const setIsAuthenticated = useStore((state) => state.setIsAuthenticated);

    const passwordTooltip = useRef(null);
    const passwordInput = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                passwordFocus &&
                !passwordTooltip.current?.contains(e.target) &&
                !passwordInput.current?.contains(e.target)
            ) {
                setPasswordFocus(false);
            }
        };

        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [passwordFocus]);

    const passwordWeaknesses = [
        "At least 8 characters",
        "Upper & lowercase letters",
        "A number",
        "A special character (@$!%*?&:)",
    ];

    function getWeaknesses() {
        let weaknesses = [];

        if (password.length < 8) {
            weaknesses.push("At least 8 characters");
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z]).+$/.test(password)) {
            weaknesses.push("Upper & lowercase letters");
        }

        if (!/(?=.*\d)/.test(password)) {
            weaknesses.push("A number");
        }

        if (!/(?=.*[@$!%*?&:])/.test(password)) {
            weaknesses.push("A special character (@$!%*?&:)");
        }

        return weaknesses;
    }

    async function handleRegister(e) {
        e.preventDefault();

        if (username.length === 0) {
            setUsernameError("Username cannot be empty");
        }

        if (password.length === 0) {
            setPasswordError("Password cannot be empty");
        }

        if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:]).{8,}$/g.test(
                password,
            )
        ) {
            setPasswordError("Password is too weak");
            setPasswordFocus(true);
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            return;
        }

        if (username.length === 0 || password.length === 0) {
            return;
        }

        const user = { username, password };

        setLoading(true);

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });

        setLoading(false);

        if (response.status === 400) {
            setUsernameError("Username already exists");
            return;
        }

        if (response.status === 201) {
            router.push("/login");

            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setUsernameError("");
            setPasswordError("");
            setConfirmPasswordError("");
            setPasswordFocus(false);

            setRequestStatus({
                success: true,
                message: "Account created successfully",
            });
            setShowAlert(true);
        } else {
            setRequestStatus({
                success: false,
                message: "Something went wrong",
            });
            setShowAlert(true);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();

        if (username.length === 0) {
            setUsernameError("Username cannot be empty");
        }

        if (password.length === 0) {
            setPasswordError("Password cannot be empty");
        }

        if (username.length === 0 || password.length === 0) {
            return;
        }

        const user = { username, password };

        setLoading(true);

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });

        setLoading(false);

        if (response.status === 200) {
            setIsAuthenticated(true);
            router.push(`/users/${username}`);
            router.refresh();

            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setUsernameError("");
            setPasswordError("");
            setConfirmPasswordError("");
            setPasswordFocus(false);

            setRequestStatus({
                success: true,
                message: "Logged in successfully",
            });
            setShowAlert(true);
        } else {
            setUsernameError("Invalid username or password");
        }
    }

    return (
        <form className="formGrid">
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />

            <Input
                required={true}
                onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError("");
                }}
                value={username}
                error={usernameError}
                label={"Username"}
            />

            <div style={{ position: "relative" }} ref={passwordInput}>
                <Input
                    type={"password"}
                    required={true}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                    }}
                    value={password}
                    error={isRegistering && passwordError}
                    label={"Password"}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                />

                {passwordFocus && isRegistering && (
                    <div
                        className={styles.passwordTooltip}
                        ref={passwordTooltip}
                        aria-live="polite"
                    >
                        <p>Your password must contain:</p>

                        <ul>
                            {passwordWeaknesses.map((weakness, index) => {
                                return (
                                    <li
                                        key={index}
                                        className={
                                            !getWeaknesses().includes(weakness)
                                                ? styles.weakness
                                                : ""
                                        }
                                    >
                                        <div>
                                            {!getWeaknesses().includes(
                                                weakness,
                                            ) && (
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                />
                                            )}
                                        </div>
                                        <span>{weakness}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {isRegistering && (
                <Input
                    type={"password"}
                    required={true}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmPasswordError("");
                    }}
                    value={confirmPassword}
                    error={confirmPasswordError}
                    label={"Password Match"}
                />
            )}

            <button
                onClick={isRegistering ? handleRegister : handleLogin}
                className="button submit"
            >
                {loading ? <Spinner /> : isRegistering ? "Register" : "Login"}
            </button>
        </form>
    );
}
