"use client";

import { Spinner, Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/client";
import { useAlerts } from "@/store/store";
import styles from "./ErrorBug.module.css";
import { useState } from "react";

export function DeleteNote({ error }) {
    const [loading, setLoading] = useState(false);

    const addAlert = useAlerts((state) => state.addAlert);

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/error/${error.id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.status === 200) {
            addAlert({
                success: true,
                message: "Successfully deleted error log",
            });

            error.note = "";
        } else {
            addAlert({
                success: false,
                message: "Something went wrong",
            });
        }

        setLoading(false);
    }

    return (
        <Tooltip>
            <TooltipTrigger>
                <button
                    className={styles.delete}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <Spinner margin={0} />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            height="20"
                            width="20"
                        >
                            <path d="m17,4v-2c0-1.103-.897-2-2-2h-6c-1.103,0-2,.897-2,2v2H1v2h1.644l1.703,15.331c.169,1.521,1.451,2.669,2.982,2.669h9.304c1.531,0,2.813-1.147,2.981-2.669l1.703-15.331h1.682v-2h-6Zm-8-2h6v2h-6v-2Zm6.957,14.543l-1.414,1.414-2.543-2.543-2.543,2.543-1.414-1.414,2.543-2.543-2.543-2.543,1.414-1.414,2.543,2.543,2.543-2.543,1.414,1.414-2.543,2.543,2.543,2.543Z" />
                        </svg>
                    )}
                </button>
            </TooltipTrigger>

            <TooltipContent>Delete error log</TooltipContent>
        </Tooltip>
    );
}
