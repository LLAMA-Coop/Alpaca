"use client";

import { Form, FormButtons, TextArea, Spinner } from "@client";
import { useAlerts } from "@/store/store";
import { useState } from "react";

export function ErrorNote({ error }) {
    const [note, setNote] = useState(error.note || "");
    const [loading, setLoading] = useState(false);

    const addAlert = useAlerts((state) => state.addAlert);

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;

        if (error.note === note || note.length > 1024) {
            return;
        }

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/error/${error.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ note }),
            }
        );

        if (response.status === 200) {
            addAlert({
                success: true,
                message: "Successfully submitted note",
            });

            error.note = note;
        } else {
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        }

        setLoading(false);
    }

    return (
        <Form
            onSubmit={handleSubmit}
            singleColumn
        >
            <TextArea
                value={note}
                maxLength={1024}
                label="Developer Note"
                placeholder="Add a note"
                onChange={(e) => setNote(e.target.value)}
            />

            <FormButtons>
                <button
                    type="submit"
                    className="button primary"
                    disabled={loading || error.note === note}
                >
                    {error.note ? "Update" : "Submit"}
                    {loading && (
                        <Spinner
                            size={12}
                            margin={0}
                        />
                    )}
                </button>

                {error.note !== note && (
                    <button
                        type="button"
                        className="button"
                        onClick={() => setNote(error.note)}
                    >
                        Reset
                    </button>
                )}
            </FormButtons>
        </Form>
    );
}
