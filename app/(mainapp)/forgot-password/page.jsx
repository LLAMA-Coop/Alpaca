"use client";

import { InfoBox, Input, Spinner } from "@client";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import styles from "../page.module.css";
import { useState } from "react";

export default function forgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [errors, setErrors] = useState({});
    const [email, setEmail] = useState("");

    const router = useRouter();

    const user = useStore((state) => state.user);
    if (user) router.push("/me/dashboard");

    async function handleSendResetEmail(e) {
        e.preventDefault();
        if (loading) return;

        if (!/^.+@.+\..+$/.test(email)) {
            return setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
        }

        try {
            setLoading(true);
            setErrors({});

            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                throw new Error("Failed to send reset email");
            }

            setWaiting(300);
            const interval = setInterval(() => {
                setWaiting((prev) => prev - 1);
            }, 1000);

            setTimeout(() => {
                clearInterval(interval);
                setWaiting(false);
            }, 300000);
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                server: "Something went wrong on our end, please try again later.",
            }));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={styles.main}>
            <header>
                <h1>Forgot Password</h1>

                <p>
                    Enter your email address below and we will send you a link to reset your
                    password. This link will expire in 1 hour.
                </p>
            </header>

            <section>
                <form
                    className={styles.forgotForm}
                    onSubmit={handleSendResetEmail}
                >
                    <Input
                        required
                        type="email"
                        name="email"
                        label="Email"
                        value={email}
                        placeholder="Email"
                        error={errors.email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                    />

                    {(waiting !== false || errors.server) && (
                        <InfoBox type={errors.server ? "danger" : undefined}>
                            {errors.server || (
                                <>
                                    An email has been sent to you with a link to reset your
                                    password. Please check your inbox and spam folder. If you do not
                                    receive an email within 5 minutes, please try again.
                                </>
                            )}
                        </InfoBox>
                    )}

                    <button
                        type="submit"
                        disabled={loading || waiting}
                        className="button submit primary"
                    >
                        Reset Password {loading && <Spinner primary />}{" "}
                        {waiting && <span className={styles.waiting}>({waiting}s)</span>}
                    </button>
                </form>
            </section>
        </main>
    );
}
