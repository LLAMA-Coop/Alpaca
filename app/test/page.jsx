"use client";

import { useModals } from "@/store/store";
import styles from "../page.module.css";

export default function Test() {
    const addModal = useModals((state) => state.addModal);

    return (
        <main className={styles.main}>
            <button
                onClick={() =>
                    addModal({
                        title: "Add a new modal",
                        content: "This is the content of the modal",
                    })
                }
            >
                Add modal
            </button>
        </main>
    );
}
