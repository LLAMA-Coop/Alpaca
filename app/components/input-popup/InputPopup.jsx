"use client";

import { SourceInput, NoteInput } from "@components/client";
import { useEffect, useRef, useState } from "react";
import styles from "./InputPopup.module.css";

export function InputPopup({ type }) {
    const [showPopup, setShowPopup] = useState(false);
    const [animateOut, setAnimateOut] = useState(false);
    const popup = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!showPopup || !popup.current) return;
            if (!popup.current.contains(e.target)) hidePopup();
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") hidePopup();
        };

        document.addEventListener("click", handleOutsideClick);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleOutsideClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showPopup]);

    const hidePopup = () => {
        setAnimateOut(true);
        setTimeout(() => {
            setShowPopup(false);
            setAnimateOut(false);
            document.documentElement.style.overflowY = "auto";
            document.documentElement.style.paddingRight = "0px";
        }, 200);
    };

    const typeContent = {
        source: "Create new source",
        note: "Create new note",
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setShowPopup(true);
                    document.documentElement.style.overflowY = "hidden";
                    document.documentElement.style.paddingRight = "17px";
                }}
                className="button blue"
            >
                {typeContent[type]}
            </button>

            {showPopup && (
                <div
                    className={styles.popup}
                    style={{
                        animationName: animateOut ? styles.fadeOut : "",
                        backgroundColor: animateOut ? "hsl(0, 0%, 0%, 0)" : "",
                    }}
                >
                    <div
                        ref={popup}
                        style={{
                            animationName: animateOut ? styles.popOut : "",
                            transform: animateOut ? "scale(0.8)" : "",
                        }}
                    >
                        <div>
                            <h4>
                                {type === "source" && "Create new source"}
                                {type === "note" && "Create new note"}
                            </h4>

                            <button type="button" onClick={() => hidePopup()}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                >
                                    <path d="M18 6l-12 12" />
                                    <path d="M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {type === "source" && <SourceInput />}
                        {type === "note" && <NoteInput />}
                    </div>
                </div>
            )}
        </>
    );
}
