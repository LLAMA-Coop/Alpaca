"use client";

import { Validator } from "@/lib/validation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Settings.module.css";
import { useAlerts } from "@/store/store";
import {
    DialogDescription,
    TooltipContent,
    TooltipTrigger,
    DialogHeading,
    DialogContent,
    FormButtons,
    Tooltip,
    Spinner,
    InfoBox,
    Dialog,
    Input,
    Form,
} from "@/app/components/client";
import { getApiUrl } from "@/lib/api";

export function Account({ user }) {
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [twoFactorOpen, setTwoFactorOpen] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [password, setPassword] = useState("");

    const [emailCodeLoading, setEmailCodeLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailOpen, setEmailOpen] = useState(false);
    const [email, setEmail] = useState(user.email);
    const [emailCode, setEmailCode] = useState("");

    const [verifyEmailLoading, setVerifyEmailLoading] = useState(false);
    const [verifyEmailWait, setVerifyEmailWait] = useState(0);
    const [errors, setErrors] = useState({});

    const addAlert = useAlerts((state) => state.addAlert);
    const router = useRouter();

    useEffect(() => {
        if (twoFactorCode.length === 6) {
            handlePasswordSubmit(null, twoFactorCode);
        }
    }, [twoFactorCode]);

    useEffect(() => {
        if (emailCode.length === 6) {
            handleEmailSubmit(null, emailCode);
        }
    }, [emailCode]);

    useEffect(() => {
        if (emailOpen) {
            handleSendEmailCode();
        }
    }, [emailOpen, email]);

    async function handlePasswordSubmit(e, code) {
        if (e) e.preventDefault();
        if (passwordLoading || !newPassword) return;

        const validator = new Validator();
        const isValid = validator.validate({
            field: "password",
            value: newPassword,
            type: "user",
        });

        if (!isValid) {
            return setErrors((prev) => ({ ...prev, newPassword: "Invalid password format" }));
        }

        if (!password) {
            return setErrors((prev) => ({
                ...prev,
                password: "Please enter your current password",
            }));
        }

        if (user.twoFactorEnabled && !code) {
            // Two factor is enabled, so we need to verify the code
            return setTwoFactorOpen(true);
        }

        try {
            setPasswordLoading(true);

            const response = await fetch(`${getApiUrl()}/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password,
                    newPassword,
                    twoFactorCode: code,
                }),
            });

            if (!response.ok) {
                const data = await response.json();

                if (data?.errors) {
                    setErrors(data.errors);

                    if (!data.errors.code) {
                        setTwoFactorOpen(false);
                        setTwoFactorCode("");
                    }
                } else {
                    throw new Error(data?.message || "Something went wrong");
                }
            } else {
                setTwoFactorOpen(false);
                setTwoFactorCode("");
                setNewPassword("");
                setPassword("");

                addAlert({
                    success: true,
                    message: "Successfully changed your password",
                });

                router.refresh();
            }
        } catch (error) {
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        } finally {
            setPasswordLoading(false);
        }
    }

    async function handleEmailSubmit(e, code) {
        if (e) e.preventDefault();
        if (emailLoading || user.email === email) return;

        const validator = new Validator();
        const isValid = validator.validate({
            field: "email",
            value: email,
            type: "user",
        });

        if (!isValid) {
            return setErrors((prev) => ({ ...prev, email: validator.errors.email }));
        }

        if (user.emailVerified && !code) {
            return setEmailOpen(true);
        }

        try {
            setEmailLoading(true);

            const response = await fetch(`${getApiUrl()}/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    emailCode: code,
                }),
            });

            if (!response.ok) {
                const data = await response.json();

                if (data?.errors) {
                    setErrors(data.errors);

                    if (!data.errors.code) {
                        setEmailOpen(false);
                        setEmailCode("");
                    }
                } else {
                    throw new Error(data?.message || "Something went wrong");
                }
            } else {
                addAlert({
                    success: true,
                    message: `Successfully changed your email${email.length ? " - please verify your email" : ""}`,
                });

                setEmailOpen(false);
                setEmailCode("");

                router.refresh();
            }
        } catch (error) {
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        } finally {
            setEmailLoading(false);
        }
    }

    async function handleSendEmailCode() {
        if (emailCodeLoading) return;

        try {
            setEmailCodeLoading(true);

            const response = await fetch(`${getApiUrl()}/auth/verify-email`, {
                method: "POST",
                body: JSON.stringify({ email: user.email }),
            });

            if (!response.ok) {
                throw new Error("Something went wrong");
            }
        } catch (error) {
            addAlert({
                success: false,
                message: "Something went wrong",
            });

            setEmailOpen(false);
        } finally {
            setEmailCodeLoading(false);
        }
    }

    async function handleVerifyEmail() {
        if (verifyEmailLoading || verifyEmailWait > 0) return;

        try {
            setVerifyEmailLoading(true);

            const response = await fetch(`${getApiUrl()}/me/verify-email`, { method: "POST" });

            if (!response.ok) {
                throw new Error("Something went wrong");
            } else {
                addAlert({
                    success: true,
                    message: "We've sent you a verification email",
                });

                setVerifyEmailWait(300);

                const interval = setInterval(() => {
                    setVerifyEmailWait((prev) => prev - 1);
                }, 1000);

                setTimeout(() => {
                    clearInterval(interval);
                    setVerifyEmailWait(0);
                }, 300000); // 5 minutes
            }
        } catch (error) {
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        } finally {
            setVerifyEmailLoading(false);
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

    return (
        <section className={styles.content}>
            <h2>Change your password</h2>

            <div className={styles.column}>
                <Form
                    fullWidth
                    className={styles.accountForm}
                    onSubmit={handlePasswordSubmit}
                >
                    <Input
                        type="password"
                        value={newPassword}
                        label="New Password"
                        placeholder="New Password"
                        error={errors.newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, newPassword: "" }));
                        }}
                    />

                    <Input
                        type="password"
                        value={password}
                        error={errors.password}
                        label="Current Password"
                        placeholder="Current Password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, password: "" }));
                        }}
                    />

                    <InfoBox
                        asDiv
                        fullWidth
                    >
                        <div className={styles.expectationsBox}>
                            <p>Your password must meet the following expectations:</p>

                            <ul>
                                {expectations.map((exp) => {
                                    return (
                                        <li
                                            key={exp.name}
                                            className={
                                                exp.regex.test(newPassword) ? styles.valid : ""
                                            }
                                        >
                                            {exp.regex.test(newPassword) && (
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

                    <div />

                    {!!newPassword.length && (
                        <FormButtons>
                            <button className="button primary small">
                                Change Password {passwordLoading && <Spinner />}
                            </button>

                            <button
                                type="button"
                                className="button small"
                                onClick={() => {
                                    setErrors((prev) => ({
                                        ...prev,
                                        newPassword: "",
                                        password: "",
                                    }));
                                    setNewPassword("");
                                    setPassword("");
                                }}
                            >
                                Cancel
                            </button>
                        </FormButtons>
                    )}

                    <Dialog
                        open={twoFactorOpen}
                        onOpenChange={() => setTwoFactorOpen(false)}
                    >
                        <DialogContent>
                            <DialogHeading>Enter your two-factor code</DialogHeading>

                            <DialogDescription>
                                You have two-factor authentication enabled. Please enter the code
                                from your authenticator app to continue.
                            </DialogDescription>

                            <Form
                                singleColumn
                                onSubmit={(e) => handlePasswordSubmit(e, twoFactorCode)}
                            >
                                <Input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Code"
                                    error={errors.code}
                                    value={twoFactorCode}
                                    label="Verification Code"
                                    onChange={(e) => {
                                        setTwoFactorCode(e.target.value);
                                        setErrors((prev) => ({ ...prev, code: "" }));
                                    }}
                                />

                                <FormButtons>
                                    <button
                                        type="button"
                                        className="button secondary"
                                        onClick={() => {
                                            setTwoFactorOpen(false);
                                            setTwoFactorCode("");
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="button primary"
                                        disabled={!twoFactorCode}
                                    >
                                        Verify {passwordLoading && <Spinner />}
                                    </button>
                                </FormButtons>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </Form>
            </div>

            <h2>Change your email</h2>

            <div>
                <Form
                    onSubmit={handleEmailSubmit}
                    className={styles.accountForm}
                >
                    <Input
                        type="email"
                        label="Email"
                        value={email || ""}
                        placeholder="Email"
                        error={errors.email}
                        labelChip={
                            user.email && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <button
                                            type="button"
                                            tabIndex={user.emailVerified ? -1 : 0}
                                            className={`${styles.emailChip} ${!user.emailVerified ? styles.button : ""}`}
                                            onClick={() => {
                                                if (!user.emailVerified) {
                                                    handleVerifyEmail();
                                                }
                                            }}
                                        >
                                            {user.emailVerified ? "Verified" : "Unverified"}
                                        </button>
                                    </TooltipTrigger>

                                    {!user.emailVerified && (
                                        <TooltipContent>
                                            {verifyEmailWait > 0 ? (
                                                `Please wait ${Math.ceil(verifyEmailWait / 60)} minutes`
                                            ) : verifyEmailLoading ? (
                                                <>
                                                    Sending <Spinner />
                                                </>
                                            ) : (
                                                "Resend verification email"
                                            )}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            )
                        }
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                    />

                    <div />

                    {email !== user.email && (
                        <FormButtons>
                            <button
                                type="submit"
                                className="button primary small"
                            >
                                Change Email
                                {emailLoading && <Spinner />}
                            </button>

                            <button
                                type="button"
                                className="button small"
                                onClick={() => {
                                    setErrors((prev) => ({ ...prev, email: "" }));
                                    setEmail(user.email);
                                }}
                            >
                                Cancel
                            </button>
                        </FormButtons>
                    )}
                </Form>

                <Dialog
                    open={emailOpen}
                    onOpenChange={() => {
                        setErrors((prev) => ({ ...prev, code: "" }));
                        setEmailCode("");
                        setEmailOpen(false);
                    }}
                >
                    {emailCodeLoading ? (
                        <DialogContent>
                            <DialogHeading>Verifying your email</DialogHeading>

                            <DialogDescription>
                                We're sending you a verification email. Please wait a moment.
                            </DialogDescription>
                        </DialogContent>
                    ) : (
                        <DialogContent>
                            <DialogHeading>Enter your email verification code</DialogHeading>

                            <DialogDescription>
                                We sent you a verification code to your current email address to
                                make sure it's you. Please enter the code to continue.
                            </DialogDescription>

                            <Form
                                singleColumn
                                onSubmit={(e) => handleEmailSubmit(e, emailCode)}
                            >
                                <Input
                                    type="text"
                                    maxLength={6}
                                    value={emailCode}
                                    placeholder="Code"
                                    error={errors.code}
                                    label="Verification Code"
                                    onChange={(e) => {
                                        setEmailCode(e.target.value);
                                        setErrors((prev) => ({ ...prev, code: "" }));
                                    }}
                                />

                                <FormButtons>
                                    <button
                                        type="button"
                                        className="button secondary"
                                        onClick={() => {
                                            setErrors((prev) => ({ ...prev, code: "" }));
                                            setEmailOpen(false);
                                            setEmailCode("");
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="button primary"
                                        disabled={!emailCode}
                                    >
                                        Verify {emailLoading && <Spinner />}
                                    </button>
                                </FormButtons>
                            </Form>
                        </DialogContent>
                    )}
                </Dialog>
            </div>

            <h2>Delete your account</h2>

            <div>
                <InfoBox type="danger">
                    If you delete your account, you will lose all your data and you won't be able to
                    recover it.
                    <br />
                    Please be sure before you delete your account.
                </InfoBox>

                <button
                    type="button"
                    className="button danger border"
                    onClick={() => {
                        alert("Not implemented yet, we're working on it!");
                    }}
                >
                    Delete Account
                </button>
            </div>
        </section>
    );
}
