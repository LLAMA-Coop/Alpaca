"use client";

import { useModals } from "@/store/store";
import styles from "../page.module.css";

export default function Home() {
    const addModal = useModals((state) => state.addModal);

    return (
        <button
            className="button"
            onClick={() => {
                addModal({
                    title: "Test Modal",
                    content:
                        "This is a test modal. This is a test modal. This is a test modal.\nThis is a test modal. This is a test modal.\nThis is a test modal.",
                });
            }}
            style={{ margin: "auto" }}
        >
            Add Modal
        </button>
    );
}
