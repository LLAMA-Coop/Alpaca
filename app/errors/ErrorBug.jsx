"use client";

import { useState } from "react";
import { Input, Spinner, DeletePopup } from "../components/client";

export default function ErrorBug({ error }) {
    const [note, setNote] = useState(error.devNote ? error.devNote : "");
    const [loading, setLoading] = useState(false);

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
    }

    return (
        <>
            <h3>
                {error.name} for {error.function}
            </h3>
            <h4>Error #{error.id}</h4>
            <p style={{ margin: "1rem" }}>{error.message}</p>
            <code style={{ display: "block", margin: "1rem" }}>
                {error.code}
            </code>
            <code
                style={{
                    display: "block",
                    margin: "1rem",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                }}
            >
                {error.stack}
            </code>
            <p>Occurred at {error.time.toString()}</p>

            <Input
                label="Developer Note"
                type="textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1024}
            />

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Note"}
            </button>

            <DeletePopup resourceType="error" resourceId={error.id} />
        </>
    );
}
