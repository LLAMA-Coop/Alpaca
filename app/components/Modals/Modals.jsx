"use client";

import { useModals } from "@/store/store";
import styles from "./Modals.module.css";
import { useEffect, useState } from "react";

export function Modals() {
    const modals = useModals((state) => state.modals);

    useEffect(() => {
        if (modals.length === 0) {
            document.documentElement.style.overflow = "auto";
        } else {
            document.documentElement.style.overflow = "hidden";
        }
    }, [modals]);

    if (modals.length === 0) return null;

    return (
        <div className={styles.container}>
            {modals.map((modal, index) => (
                <Modal
                    key={modal.id}
                    modal={modal}
                    index={index}
                    length={modals.length}
                />
            ))}
        </div>
    );
}

export function Modal({ modal, index, length }) {
    const [closing, setClosing] = useState(false);
    const removeModal = useModals((state) => state.removeModal);
    const addModal = useModals((state) => state.addModal);

    function close() {
        setClosing(true);
        setTimeout(() => {
            removeModal(modal.id);
        }, 200);
    }

    return (
        <div
            className={styles.wrapper}
            onClick={() => close()}
            style={{
                zIndex: 1000 + index,
                backgroundColor: index === 0 ? "rgba(0, 0, 0, 0.5)" : "",
                animation:
                    index === 0
                        ? closing
                            ? `${styles.fadeOut} 0.25s ease`
                            : `${styles.fadeIn} 0.2s ease`
                        : "",
            }}
        >
            <div
                tabIndex="0"
                ref={(el) => el && el.focus()}
                aria-modal="true"
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                style={{
                    animationName:
                        closing || index < length - 1
                            ? `${styles.fadeOut}, ${styles.popOut}`
                            : "",
                    animationDuration: index < length - 1 ? "1s" : "",
                }}
            >
                <header>
                    <h2>{modal.title || "Modal Title"}</h2>

                    <button onClick={() => close()}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6l-12 12" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className={styles.content}>
                    {modal.content}

                    <button
                        onClick={() =>
                            addModal({
                                title: "Add a new modal",
                                content: "This is the content of the modal",
                            })
                        }
                    >
                        Add other modal
                    </button>

                    {index > 0 && (
                        <button
                            onClick={() => {
                                removeModal(modal.id);
                            }}
                        >
                            Remove this modal
                        </button>
                    )}
                </div>

                <footer>
                    <button
                        className="button transparent"
                        onClick={() => close()}
                    >
                        Close
                    </button>

                    <button onClick={() => {}} className="button">
                        Save
                    </button>
                </footer>
            </div>
        </div>
    );
}
