"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import { useAlerts } from "@/store/store";
import QRCode from "react-qr-code";
import { nanoid } from "nanoid";
import {
    DialogDescription,
    TooltipContent,
    TooltipTrigger,
    DialogContent,
    DialogButtons,
    DialogHeading,
    FormButtons,
    InfoBox,
    Tooltip,
    Spinner,
    Dialog,
    Input,
} from "@client";
import { getApiUrl } from "@/lib/api";

export function Security({ user }) {
    const [revokeCurrent, setRevokeCurrent] = useState(false);
    const [revokeLoading, setRevokeLoading] = useState(false);
    const [openRevoke, setOpenRevoke] = useState(false);
    const [revokeAll, setRevokeAll] = useState(false);
    const [session, setSession] = useState(null);

    const [confirmedDisable, setConfirmedDisable] = useState(false);
    const [useSecretInstead, setUseSecretInstead] = useState(false);
    const [openDisable, setOpenDisable] = useState(false);
    const [open, setOpen] = useState(false);

    const [hasCopied, setHasCopied] = useState(false);
    const [secret, setSecret] = useState(null);
    const [uri, setUri] = useState(null);

    const [codeLoading, setCodeLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [codes, setCodes] = useState(user.twoFactorRecovery ?? []);
    const [code, setCode] = useState("");

    const addAlert = useAlerts((state) => state.addAlert);
    const { twoFactorEnabled } = user;
    const router = useRouter();

    useEffect(() => {
        if (open && !codes.length) {
            handleGenerate();
        } else {
            setSecret(null);
            setUri(null);
            setCode("");
        }
    }, [open, codes]);

    useEffect(() => {
        const func = confirmedDisable ? handleDisable : handleSubmit;

        if (code.length === 6 && !useSecretInstead) {
            func();
        }

        if (code.length === 11 && useSecretInstead) {
            func();
        }
    }, [code, useSecretInstead, confirmedDisable]);

    useEffect(() => {
        if (error) {
            addAlert({ success: false, message: error });
        }
    }, [error]);

    async function handleGenerate() {
        if (loading) return;

        try {
            setLoading(true);

            // Call the API to generate a 2FA secret
            const response = await fetch(`${getApiUrl()}/2fa/generate`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to generate 2FA secret.");
            }

            const { secret, uri } = await response.json();

            setUri(uri);
            setErrors({});
            setError(null);
            setSecret(secret);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (loading) return;

        if (code.length !== 6) {
            return setErrors({ code: "Verification code must be 6 characters." });
        }

        try {
            setCodeLoading(true);

            // Call the API to enable 2FA
            const response = await fetch(`${getApiUrl()}/2fa/enable`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                setErrors({ code: message });
            } else {
                const { codes } = await response.json();
                setCodes(codes);

                setErrors({});
                setError(null);

                user.twoFactorRecovery = codes;

                addAlert({
                    success: true,
                    message: "2FA enabled successfully",
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setCodeLoading(false);
        }
    }

    async function handleRegenerate() {
        if (loading) return;

        try {
            // Call the API to regenerate 2FA recovery codes
            const response = await fetch(`${getApiUrl()}/2fa/regenerate`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to regenerate recovery codes.");
            }

            const { codes } = await response.json();

            setErrors({});
            setError(null);
            setCodes(codes);
        } catch (error) {
            setError(error.message);
        }
    }

    async function handleDisable() {
        if (codeLoading) return;

        if (code.length !== 6 && !useSecretInstead) {
            return setErrors({ code: "Verification code must be 6 characters." });
        }

        if (code.length !== 11 && useSecretInstead) {
            return setErrors({ code: "Recovery code must be 11 characters." });
        }

        try {
            setCodeLoading(true);

            // Call the API to disable 2FA
            const response = await fetch(`${getApiUrl()}/2fa/disable`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                setErrors({ code: message });
            } else {
                addAlert({
                    success: true,
                    message: "2FA disabled successfully",
                });

                setCode("");
                setCodes([]);
                setErrors({});
                setError(null);
                setOpenDisable(false);
                setConfirmedDisable(false);
                setUseSecretInstead(false);

                router.refresh();
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setCodeLoading(false);
        }
    }

    async function handleRevoke() {
        if (revokeLoading) return;

        try {
            setRevokeLoading(true);

            // Call the API to revoke sessions
            const response = await fetch(`${getApiUrl()}/auth/session`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ session, all: revokeAll }),
            });

            if (!response.ok) {
                throw new Error("Failed to revoke sessions.");
            }

            const { message } = await response.json();

            addAlert({
                success: true,
                message,
            });

            setRevokeLoading(false);
            setRevokeCurrent(false);
            setRevokeAll(false);
            setOpenRevoke(false);
            setSession(null);

            router.refresh();
        } catch (error) {
            setError(error.message);
        } finally {
            setRevokeLoading(false);
        }
    }

    return (
        <section className={styles.content}>
            <h2>2 Factor Authentication</h2>

            <div>
                <InfoBox fullWidth>
                    {twoFactorEnabled ? (
                        <>
                            Two-factor authentication is enabled on your account. You can use an
                            authenticator app to generate a verification code. If you lose access to
                            your authenticator app, you can use recovery codes to sign in.
                        </>
                    ) : (
                        <>
                            We take security seriously. Protect your account with two-factor
                            authentication. Two-factor authentication adds an extra layer of
                            security to your account by requiring a second step of verification when
                            you sign in. This helps prevent unauthorized access to your account,
                            even if your password is compromised.{" "}
                        </>
                    )}
                </InfoBox>

                <p>
                    {twoFactorEnabled
                        ? "2 Factor Authentication is enabled on your account."
                        : "Enable 2FA to add an extra layer of security to your account."}
                </p>

                <div>
                    <FormButtons>
                        {twoFactorEnabled ? (
                            <>
                                <button
                                    className="button"
                                    onClick={() => setOpen(true)}
                                >
                                    View Recovery Codes
                                </button>

                                <button
                                    className="button danger border"
                                    onClick={() => setOpenDisable(true)}
                                >
                                    Disable 2 Factor Authentication
                                </button>
                            </>
                        ) : (
                            <button
                                className="button primary border"
                                onClick={() => setOpen((val) => !val)}
                            >
                                Enable 2 Factor Authentication
                            </button>
                        )}
                    </FormButtons>

                    <Dialog
                        open={confirmedDisable && !loading}
                        onOpenChange={() => setConfirmedDisable((val) => !val)}
                    >
                        <DialogContent>
                            <DialogHeading>
                                {useSecretInstead
                                    ? "Enter one of your recovery codes"
                                    : "Enter your verification code"}
                            </DialogHeading>

                            <DialogDescription>
                                {useSecretInstead
                                    ? "If you don't have access to your authenticator app, you can use one of your recovery codes to disable 2FA."
                                    : "Enter the verification code generated by your authenticator app to disable 2FA."}
                            </DialogDescription>

                            <Input
                                type="text"
                                value={code}
                                error={errors.code}
                                maxLength={useSecretInstead ? 11 : 6}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder={useSecretInstead ? "Recovery Code" : "XXXXXX"}
                                label={useSecretInstead ? "Recovery Code" : "Verification Code"}
                            />

                            <button
                                className={styles.toggle}
                                onClick={() => setUseSecretInstead((val) => !val)}
                            >
                                {useSecretInstead
                                    ? "Use Verification Code Instead"
                                    : "Use Recovery Code Instead"}
                            </button>

                            <DialogButtons>
                                <button
                                    className="button transparent"
                                    onClick={() => {
                                        setConfirmedDisable(false);
                                        setUseSecretInstead(false);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={codeLoading}
                                    onClick={handleDisable}
                                    className="button danger"
                                >
                                    Submit {codeLoading && <Spinner primary />}
                                </button>
                            </DialogButtons>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={openDisable && !loading}
                        onOpenChange={() => setOpenDisable((val) => !val)}
                    >
                        <DialogContent>
                            <DialogHeading>Disable 2 Factor Authentication</DialogHeading>

                            <DialogDescription>
                                Are you sure you want to disable 2 Factor Authentication? You will
                                no longer need to enter a verification code when you sign in.
                            </DialogDescription>

                            <DialogButtons>
                                <button
                                    className="button transparent"
                                    onClick={() => setOpenDisable(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={loading}
                                    className="button danger"
                                    onClick={() => {
                                        setOpenDisable(false);
                                        setConfirmedDisable(true);
                                    }}
                                >
                                    Disable 2FA
                                </button>
                            </DialogButtons>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={open && !loading}
                        onOpenChange={(val) => setOpen(val)}
                    >
                        <DialogContent>
                            <div className={styles.totp}>
                                {!codes.length ? (
                                    <>
                                        <DialogHeading>Setup Authenticator App</DialogHeading>

                                        <div className={styles.qr}>
                                            <QRCode
                                                value={uri}
                                                size={180}
                                            />
                                        </div>

                                        <p>
                                            If you can't scan the QR code, you can manually add this
                                            code to your authenticator app:{" "}
                                            <code
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(secret);
                                                        addAlert({
                                                            success: true,
                                                            message:
                                                                "Secret key copied to clipboard.",
                                                        });
                                                    } catch (error) {
                                                        setError("Failed to copy secret key.");
                                                    }
                                                }}
                                            >
                                                {secret}
                                            </code>
                                        </p>

                                        <p>
                                            After scanning the QR code, enter the code generated by
                                            your authenticator app below.
                                        </p>

                                        <Input
                                            small
                                            type="text"
                                            value={code}
                                            placeholder="XXXXXX"
                                            label="Verification Code"
                                            onChange={(e) => setCode(e.target.value)}
                                        />

                                        {!!errors.code && (
                                            <InfoBox type="danger">{errors.code}</InfoBox>
                                        )}

                                        <DialogButtons>
                                            <button
                                                className="button transparent"
                                                onClick={() => setOpen(false)}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                disabled={codeLoading}
                                                onClick={handleSubmit}
                                                className="button primary"
                                            >
                                                Verify {codeLoading && <Spinner primary />}
                                            </button>
                                        </DialogButtons>
                                    </>
                                ) : (
                                    <>
                                        <DialogHeading>Recovery Codes</DialogHeading>

                                        <DialogDescription>
                                            You can use recovery codes as a second factor to
                                            authenticate in case you lose access to your
                                            authenticator app. We recommend saving these codes in a
                                            secure place.
                                        </DialogDescription>

                                        <InfoBox type="warning">
                                            Keep these codes safe. If you lose your device and you
                                            don't have the recovery codes, you will lose access to
                                            your account.
                                        </InfoBox>

                                        <ul className={styles.codes}>
                                            {codes?.map((code) => (
                                                <li
                                                    key={code.code}
                                                    className={`${code.used ? styles.used : ""}`}
                                                >
                                                    {code.code}
                                                </li>
                                            ))}
                                        </ul>

                                        {!!twoFactorEnabled && (
                                            <button
                                                type="button"
                                                disabled={loading}
                                                className={styles.regenerate}
                                                onClick={handleRegenerate}
                                            >
                                                Regenerate Recovery Codes
                                            </button>
                                        )}

                                        <div className={styles.right}>
                                            <button
                                                className="button success border"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(
                                                            codes?.map((c) => c.code).join("\n")
                                                        );
                                                        setHasCopied(true);
                                                        addAlert({
                                                            success: true,
                                                            message:
                                                                "Recovery codes copied to clipboard",
                                                        });
                                                    } catch (error) {
                                                        setError("Failed to copy recovery codes");
                                                    }
                                                }}
                                            >
                                                Copy to clipboard
                                            </button>

                                            <button
                                                className="button success border"
                                                onClick={async () => {
                                                    const blob = new Blob(
                                                        [codes?.map((c) => c.code).join("\n")],
                                                        {
                                                            type: "text/plain",
                                                        }
                                                    );
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement("a");
                                                    a.href = url;
                                                    a.download = "alpaca-recovery-codes.txt";
                                                    a.click();

                                                    URL.revokeObjectURL(url);
                                                    setHasCopied(true);
                                                }}
                                            >
                                                Download
                                            </button>
                                        </div>

                                        <DialogButtons>
                                            <button
                                                disabled={
                                                    (!hasCopied || loading) && !twoFactorEnabled
                                                }
                                                className="button"
                                                onClick={() => {
                                                    if (twoFactorEnabled) {
                                                        return setOpen(false);
                                                    }

                                                    if (!hasCopied) {
                                                        return;
                                                    }

                                                    setHasCopied(false);
                                                    setOpen(false);
                                                    router.refresh();
                                                }}
                                            >
                                                {twoFactorEnabled ? "Close" : "Done"}
                                            </button>
                                        </DialogButtons>
                                    </>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <h2>Device Management</h2>

            <div>
                <p>
                    Manage your active sessions. If you see a session you don't recognize, you can
                    log out of that session.
                </p>

                {!user.sessions.length ? (
                    <p>You don't have any active sessions.</p>
                ) : (
                    <>
                        <ul>
                            {user.sessions?.map((session) => (
                                <li
                                    key={nanoid()}
                                    className={styles.device}
                                >
                                    <aside>{deviceIcons[session.device ?? "Unknown"]}</aside>

                                    <main>
                                        <header>
                                            <p>
                                                {session.device} - {session.ip}
                                            </p>

                                            {!!session.isCurrent && <span>Current Session</span>}
                                        </header>

                                        {!!session.location && (
                                            <p>
                                                {session.location?.city}, {session.location?.region}
                                                , {session.location?.country}
                                            </p>
                                        )}

                                        <p>
                                            {new Date(session.login).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "numeric",
                                                minute: "numeric",
                                            })}
                                        </p>
                                    </main>

                                    <Tooltip placement="right">
                                        <TooltipTrigger>
                                            <button
                                                className={styles.revoke}
                                                onClick={() => {
                                                    if (session.isCurrent) {
                                                        setRevokeCurrent(true);
                                                    }

                                                    setSession(session);
                                                    setOpenRevoke(true);
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 512.021 512.021"
                                                    fill="currentColor"
                                                    height="14"
                                                    width="14"
                                                    x="0px"
                                                    y="0px"
                                                >
                                                    <g>
                                                        <path d="M301.258,256.01L502.645,54.645c12.501-12.501,12.501-32.769,0-45.269c-12.501-12.501-32.769-12.501-45.269,0l0,0   L256.01,210.762L54.645,9.376c-12.501-12.501-32.769-12.501-45.269,0s-12.501,32.769,0,45.269L210.762,256.01L9.376,457.376   c-12.501,12.501-12.501,32.769,0,45.269s32.769,12.501,45.269,0L256.01,301.258l201.365,201.387   c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L301.258,256.01z" />
                                                    </g>
                                                </svg>
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Revoke This Session</TooltipContent>
                                    </Tooltip>
                                </li>
                            ))}
                        </ul>

                        <button
                            className="button danger"
                            onClick={() => {
                                setRevokeAll(true);
                                setOpenRevoke(true);
                            }}
                        >
                            Revoke All Sessions
                        </button>
                    </>
                )}

                <Dialog
                    open={openRevoke}
                    onOpenChange={() => {
                        setSession(null);
                        setRevokeCurrent(false);
                        setRevokeAll(false);
                        setOpenRevoke(false);
                    }}
                >
                    <DialogContent>
                        <DialogHeading>
                            {revokeAll
                                ? "Revoke All Sessions"
                                : revokeCurrent
                                  ? "Revoke Current Session"
                                  : "Revoke Session"}
                        </DialogHeading>

                        <DialogDescription>
                            {revokeAll
                                ? "Are you sure you want to revoke all sessions? You will be logged out of all devices."
                                : revokeCurrent
                                  ? "Are you sure you want to revoke the current session? You will be logged out of this device."
                                  : "Are you sure you want to revoke this session? You will be logged out of this device."}
                        </DialogDescription>

                        <DialogButtons>
                            <button
                                className="button transparent"
                                onClick={() => {
                                    setSession(null);
                                    setRevokeCurrent(false);
                                    setRevokeAll(false);
                                    setOpenRevoke(false);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleRevoke}
                                className="button danger"
                            >
                                Revoke {revokeLoading && <Spinner primary />}
                            </button>
                        </DialogButtons>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}

const deviceIcons = {
    Unknown: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="currentColor"
            height="44"
            width="44"
        >
            <g>
                <path d="m416.667 482h-49.267v-34.267h-222.8v34.267h-49.266c-19.796.698-19.944 29.241 0 30h321.333c19.765-.684 19.972-29.231 0-30z" />
                <path d="m464.866 0h-417.733c-26.031 0-47.133 21.059-47.133 47.133v243.133c0 26.034 21.062 47.134 47.133 47.134h417.733c26.03 0 47.134-21.057 47.134-47.133v-243.134c0-26.033-21.061-47.133-47.134-47.133zm-208.866 296.167c-8.278 0-15-6.721-15-15 .744-19.874 29.259-19.869 30 0 0 8.278-6.721 15-15 15zm15-89.791v18.557c0 8.284-6.716 15-15 15s-15-6.716-15-15v-32.133c0-8.284 6.716-15 15-15 27.166 0 49.267-22.101 49.267-49.267-2.468-65.251-96.062-65.265-98.533-.015-.726 19.886-29.29 19.877-30-.001 0-43.699 35.552-79.25 79.251-79.25 96.112 2.5 108.088 136.983 15.015 157.109z" />
                <path d="m47.133 367.4c-17.74 0-34.088-6.036-47.133-16.14v19.34c0 26.033 21.062 47.133 47.133 47.133h417.733c26.03 0 47.134-21.057 47.134-47.133v-19.34c-13.046 10.104-29.394 16.14-47.134 16.14z" />
            </g>
        </svg>
    ),
    Windows: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            height="44"
            width="44"
        >
            <path d="M5,19h6v2H7a1,1,0,0,0,0,2H17a1,1,0,0,0,0-2H13V19h6a5.009,5.009,0,0,0,4.9-4H.1A5.009,5.009,0,0,0,5,19Z" />
            <path d="M19,1H5A5.006,5.006,0,0,0,0,6v7H24V6A5.006,5.006,0,0,0,19,1Z" />
        </svg>
    ),
    Mac: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 85.348 85.348"
            fill="currentColor"
            height="44"
            width="44"
            x="0px"
            y="0px"
        >
            <g>
                <g>
                    <path
                        style="fill:#010002;"
                        d="M77.45,57.691v-3.16V35.563V16.595c0-1.736-1.424-3.16-3.164-3.16h-63.22    c-1.739,0-3.167,1.417-3.167,3.16v18.968v18.968v3.16L0,67.175c0,2.613,2.122,4.738,4.738,4.738H80.61    c2.616,0,4.738-2.126,4.738-4.738L77.45,57.691z M49.002,70.339H36.358c-0.44,0-0.791-0.351-0.791-0.791s0.351-0.791,0.791-0.791    h12.644c0.433,0,0.791,0.351,0.791,0.791C49.782,69.988,49.435,70.339,49.002,70.339z M29.644,67.179l2.412-2.895h21.237    l2.412,2.895H29.644z M72.998,52.101c0,1.525-1.242,2.759-2.756,2.759H15.106c-1.514,0-2.756-1.245-2.756-2.759V19.032    c0-1.525,1.242-2.759,2.756-2.759h55.136c1.514,0,2.756,1.242,2.756,2.759C72.998,19.032,72.998,52.101,72.998,52.101z"
                    />
                    <path
                        style="fill:#010002;"
                        d="M56.052,42.778c-0.762-0.329-1.442-0.777-2.058-1.335c-0.44-0.397-0.816-0.866-1.12-1.378    c-0.222-0.369-0.426-0.748-0.58-1.138c-0.154-0.39-0.247-0.812-0.351-1.217c-0.075-0.301-0.125-0.601-0.143-0.909    c-0.025-0.673-0.014-1.335,0.143-1.997c0.132-0.54,0.297-1.059,0.54-1.553c0.598-1.199,1.471-2.129,2.623-2.809    c0.079-0.061,0.168-0.111,0.268-0.175c-0.075-0.075-0.122-0.136-0.175-0.2c-0.619-0.769-1.367-1.399-2.212-1.89    c-0.462-0.268-0.948-0.494-1.432-0.698c-0.286-0.122-0.594-0.197-0.895-0.261c-0.279-0.064-0.58-0.089-0.862-0.125    c-0.748-0.089-1.489,0.014-2.215,0.154c-0.354,0.064-0.687,0.183-1.031,0.293c-0.283,0.082-0.558,0.197-0.83,0.293    c-0.24,0.082-0.483,0.197-0.727,0.261c-0.372,0.104-0.755,0.2-1.134,0.276c-0.68,0.147-1.353,0.025-2.011-0.136    c-0.308-0.075-0.601-0.19-0.902-0.286c-0.354-0.115-0.698-0.24-1.056-0.358c-0.308-0.1-0.616-0.222-0.934-0.286    c-0.372-0.079-0.759-0.132-1.142-0.2c-0.82-0.129-1.628,0-2.426,0.215c-0.412,0.107-0.812,0.29-1.202,0.462    c-0.63,0.265-1.192,0.655-1.714,1.081c-0.705,0.555-1.299,1.224-1.811,1.958c-0.347,0.487-0.641,0.988-0.83,1.553    c-0.15,0.419-0.286,0.845-0.404,1.278c-0.089,0.344-0.175,0.684-0.222,1.034c-0.057,0.387-0.082,0.784-0.1,1.174    c-0.021,0.476-0.029,0.952-0.014,1.417c0.018,0.447,0.061,0.895,0.107,1.335c0.05,0.419,0.111,0.837,0.186,1.26    c0.057,0.301,0.136,0.594,0.215,0.891c0.111,0.429,0.218,0.863,0.358,1.281c0.161,0.483,0.34,0.963,0.537,1.424    c0.265,0.623,0.54,1.242,0.855,1.843c0.548,1.034,1.188,2.026,1.904,2.963c0.48,0.63,0.984,1.231,1.593,1.746    c0.701,0.608,1.474,1.063,2.412,1.231c0.812,0.14,1.564-0.029,2.301-0.308c0.372-0.147,0.73-0.308,1.099-0.462    c0.616-0.265,1.267-0.426,1.936-0.49c0.812-0.075,1.603-0.057,2.384,0.175c0.433,0.125,0.859,0.286,1.274,0.462    c0.594,0.243,1.17,0.519,1.818,0.623c0.888,0.14,1.682-0.064,2.444-0.483c0.684-0.372,1.27-0.873,1.782-1.46    c0.501-0.58,0.97-1.188,1.417-1.811c0.455-0.63,0.888-1.27,1.267-1.943c0.462-0.823,0.859-1.693,1.285-2.541    c0.05-0.097,0.011-0.165-0.075-0.211C56.138,42.792,56.091,42.792,56.052,42.778z"
                    />
                    <path
                        style="fill:#010002;"
                        d="M43.945,27.027c0.551-0.179,1.07-0.437,1.564-0.755c0.694-0.455,1.288-1.016,1.779-1.693    c0.512-0.687,0.898-1.446,1.152-2.265c0.186-0.601,0.301-1.21,0.258-1.9c0-0.136,0.007-0.329,0-0.523    c-0.007-0.222-0.047-0.261-0.258-0.222c-0.455,0.097-0.923,0.175-1.364,0.34c-0.512,0.2-1.002,0.44-1.467,0.719    c-1.077,0.637-1.911,1.51-2.537,2.588c-0.293,0.508-0.523,1.027-0.691,1.578c-0.075,0.261-0.143,0.54-0.179,0.82    c-0.061,0.455-0.068,0.923-0.007,1.385c0.014,0.132,0.054,0.193,0.19,0.19C42.918,27.282,43.437,27.189,43.945,27.027z"
                    />
                </g>
            </g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
        </svg>
    ),
    Linux: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 469.181 469.181"
            fill="currentColor"
            height="44"
            width="44"
            x="0px"
            y="0px"
        >
            <g>
                <g>
                    <g>
                        <path
                            style="fill:#010002;"
                            d="M436.695,0H32.502C16.586,0,3.621,12.949,3.621,28.873v304.44     c0,15.924,12.965,28.881,28.881,28.881h114.15c8.478,10.99,25.605,37.359,19.614,49.893c-2.43,5.048-9.039,7.616-19.663,7.616     c-57.445,0-59.103,20.354-59.103,22.671v26.808h294.198v-35.034l-1.634-1.227c-0.707-0.553-17.826-13.217-60.103-13.217     c-9.242,0-11.063-3.609-11.689-4.788c-5.267-10.331,9.015-37.05,20.004-52.714h108.411c15.924,0,28.873-12.957,28.873-28.881     V28.873C465.568,12.949,452.619,0,436.695,0z M300.948,418.646c3.138,6.17,9.535,9.291,19.021,9.291     c32.116,0,48.552,7.706,53.486,10.518v22.484H95.759l-0.016-18.362c0.423-4.064,10.405-14.64,50.86-14.64     c14.079,0,23.183-4.129,27.093-12.299c7.551-15.753-8.047-41.179-16.769-53.445h161.409     C309.752,375.304,293.324,403.738,300.948,418.646z M220.988,331.898c0-7.511,6.096-13.599,13.615-13.599     c7.511,0,13.607,6.088,13.607,13.599c0,7.527-6.096,13.623-13.607,13.623C227.084,345.513,220.988,339.417,220.988,331.898z      M440.817,301.091H28.381V29.97h412.436V301.091z"
                        />
                    </g>
                    <g>
                        <path
                            style="fill:#010002;"
                            d="M278.424,202.467c-3.536,4.105-8.836,9.421-13.827,8.543c-5.007-0.894-2.764-11.461-7.462-11.461     c-4.706,0-5.584,0.878-5.584,4.398l0.219,26.572c0,0-2.081,10.283,4.121,12.364c6.161,2.065,9.291-2.162,16.355-5.389     c7.047-3.227,13.567-7.958,16.794-9.722c3.227-1.74,7.649-10.884,3.536-12.063c-4.113-1.179-8.454-0.756-9.047-3.398     C282.944,209.652,284,199.353,278.424,202.467z"
                        />
                    </g>
                    <g>
                        <path
                            style="fill:#010002;"
                            d="M184.897,235.095c7.82,0.219,21.191,5.048,21.191,5.048c3.568,0,7.616-2.024,9.917-4.82     c2.3-2.812-3.544-11.291-4.04-12.575c-0.512-1.268-15.501-20.817-18.037-21.833c-2.561-1.016-6.438,2.43-7.454,4.983     c-1.016,2.561-5.471-0.797-8.015-0.797c-2.552,0-6.121,6.787-4.081,8.316c4.568,4.186,1.016,10.071,1.016,10.071     s-1.187,1.544-1.699,6.137C170.81,237.623,181.076,234.583,184.897,235.095z"
                        />
                    </g>
                    <g>
                        <path
                            style="fill:#010002;"
                            d="M194.765,195.086c3.097,3.885,16.534,21.443,16.534,21.443s3.455,4.032,6.275,1.447     c2.837-2.577-3.804-12.908-3.804-12.908c-14.168-12.087-14.737-14.274-14.737-14.274c-3.081-10.583,9.437-22.841,9.437-24.126     c2.926-5.154,5.804-14.136,5.804-14.136s9.852,4.836,15.956,4.836c0,0,14.249,0.967,19.175-7.99     c0.788-1.422,2.178,7.364,2.178,9.917c0,2.585,0.431,5.674,5.584,13.9c5.145,8.267,5.186,18.964,5.186,18.964     c0,9.941,4.788,12.079,4.788,12.079c3.43,0,13.176-8.941,13.176-8.941c0-4.471-3.211-28.539-13.518-37.123     c-10.323-8.584-14.396-15.119-14.396-15.119s0.528-11.9,0.057-29.385c-1.715-16.493-24.15-18.444-24.15-18.444     c-13.908,0-23.711,12.835-25.264,19.273c-1.528,6.438,6.942,34.116,5.406,37.717c-0.114,3.552-19.061,23.914-19.102,24.012     c-3.869,5.414-5.219,19.517-5.219,19.517C185.929,192.907,194.765,195.086,194.765,195.086z M240.244,114.141     c5.154,0,6.706,6.942,6.706,6.942c0,2.333-0.219,7.21-0.219,7.21c0,0.301-2.601,0.837-5.844,0.984     c0.309-0.667,0.585-1.422,0.715-2.317c0.341-2.561-0.471-4.292-1.764-4.463c-1.284-0.163-2.56,1.268-2.894,3.796     c-0.154,1.097-0.073,2.081,0.146,2.918c-1.544-0.146-3.04-0.423-4.398-0.886C229.271,112.304,240.244,114.141,240.244,114.141z      M238.204,130.984c0.146,0.089,0.26,0.236,0.415,0.26l0.146-0.065c2.878,0.927,5.414,2.016,6.682,2.918     c4.024,4.032-0.886,9.405-1.65,9.25c-0.163-0.024-7.169,4.381-14.014,4.341c-6.21-0.041-12.177-4.568-15.249-5.064     c-3.707-1.577-2.235-3.365-1.455-4.666c0,0,2.561-3.13,6.308-5.706l0.024,0.024l1.04-0.585c0,0,0-0.065,0.016-0.122     c2.219-1.357,4.739-2.471,7.365-2.585C230.132,128.854,234.375,129.765,238.204,130.984z M213.859,114.312     c12.607-0.886,10.161,12.949,10.161,12.949l-3.438,1.87c-0.146-1.057-0.406-2.162-0.602-2.837     c-0.447-1.569-2.886-3.764-4.276-3.381c-1.398,0.39-0.919,4.617-0.471,6.202c0.195,0.675,0.862,1.439,1.666,2.04L213.46,133     c-2.845-2.057-4.828-9.38-4.828-9.38C208.624,115.653,213.859,114.312,213.859,114.312z"
                        />
                    </g>
                    <g>
                        <path
                            style="fill:#010002;"
                            d="M226.068,224.316c0,0-3.926-0.26-3.926,2.788c0,1.674-0.951,5.901,1.439,5.901     c2.382,0,22.004,0.008,22.963,0.008c0.935,0,1.414-1.422,1.414-2.374c0-0.943,0-15.192,0-15.192s-10.673,9.299-14.03,9.063     C230.579,224.259,228.214,224.316,226.068,224.316z"
                        />
                    </g>
                </g>
            </g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
        </svg>
    ),
    Mobile: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            height="44"
            width="44"
        >
            <path d="M15,0H9A5.006,5.006,0,0,0,4,5V16H20V5A5.006,5.006,0,0,0,15,0Z" />
            <path d="M4,19a5.006,5.006,0,0,0,5,5h6a5.006,5.006,0,0,0,5-5V18H4Zm8,1a1,1,0,1,1-1,1A1,1,0,0,1,12,20Z" />
        </svg>
    ),
    Tablet: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            height="44"
            width="44"
        >
            <path d="M13,20a1,1,0,0,1-2,0V19H2a5.006,5.006,0,0,0,5,5H17a5.006,5.006,0,0,0,5-5H13Z" />
            <path d="M17,0H7A5.006,5.006,0,0,0,2,5V17H22V5A5.006,5.006,0,0,0,17,0Z" />
        </svg>
    ),
};
