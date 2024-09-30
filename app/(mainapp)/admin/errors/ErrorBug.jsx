"use client";

import { useState } from "react";
import { Input, Spinner, DeletePopup } from "../components/client";
import { useAlerts } from "@/store/store";
import styles from "./ErrorBug.module.css";

export default function ErrorBug({ error }) {
    const [note, setNote] = useState(error.devNote ? error.devNote : "");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const addAlert = useAlerts((state) => state.addAlert);

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/error/${error.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ note }),
            },
        );

        setLoading(false);
        setIsSubmitted(true);

        if (response.status === 200) {
            addAlert({
                success: true,
                message: "Note submitted",
            });
        } else {
            addAlert({
                success: false,
                message: "Something went wrong. Check response in Network tab.",
            });
        }
    }

    return (
        <>
            <h3>
                {error.name} for {error.function}
            </h3>
            <h4>Error #{error.id}</h4>
            <div className={styles.block}>
                <h5>Message</h5>
                <p>{error.message}</p>
            </div>
            <div className={styles.block}>
                <h5>Code</h5>
                <code className={styles.code}>{error.code}</code>
            </div>
            <div className={styles.block}>
                <h5>Stack</h5>
                <code className={styles.stack}>{error.stack}</code>
            </div>
            {error.sql && (
                <div className={styles.block}>
                    <h5>SQL code</h5>
                    <code className={styles.sql}>{error.sql}</code>
                </div>
            )}
            <p>Occurred at {error.time.toString()}</p>

            <Input
                label="Developer Note"
                type="textarea"
                value={note}
                onChange={(e) => {
                    setNote(e.target.value);
                    setIsSubmitted(false);
                }}
                maxLength={1024}
            />

            <button
                onClick={handleSubmit}
                disabled={isSubmitted}
                className="button submit"
            >
                {loading ? <Spinner /> : "Submit Note"}
            </button>

            <DeletePopup resourceType="error" resourceId={error.id} />
        </>
    );
}
