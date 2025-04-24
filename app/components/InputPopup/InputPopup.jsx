"use client";

import { SourceInput, NoteInput, QuizInput, Permissions } from "@client";
import { useEffect, useRef, useState } from "react";
import { CourseInput } from "../Course/CourseInput";
import styles from "./InputPopup.module.css";

export function InputPopup({ type, resource, setter }) {
    const [showPopup, setShowPopup] = useState(false);
    const [animateOut, setAnimateOut] = useState(false);
    const popup = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") hidePopup();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
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
        quiz: resource ? "Edit quiz question" : "Create new quiz question",
        source: resource ? "Edit source" : "Create new source",
        note: resource ? "Edit note" : "Create new note",
        course: resource ? "Edit course" : "Create new course",
        permissions: "Edit permissions",
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
                    onClick={() => hidePopup()}
                    style={{
                        animationName: animateOut ? styles.fadeOut : "",
                        backgroundColor: animateOut ? "hsl(0, 0%, 0%, 0)" : "",
                    }}
                >
                    <div
                        ref={popup}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animationName: animateOut ? styles.popOut : "",
                            transform: animateOut ? "scale(0.8)" : "",
                        }}
                    >
                        <div>
                            <h4>{typeContent[type]}</h4>

                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={() => hidePopup()}
                            >
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

                        {type === "quiz" &&
                            (resource ? <QuizInput quiz={resource} /> : <QuizInput />)}

                        {type === "note" &&
                            (resource ? <NoteInput note={resource} /> : <NoteInput />)}

                        {type === "source" &&
                            (resource ? <SourceInput source={resource} /> : <SourceInput />)}

                        {type === "course" &&
                            (resource ? <CourseInput course={resource} /> : <CourseInput />)}

                        {/* {type === "permissions" &&
                            setter &&
                            (resource ? (
                                <Permissions
                                    permissions={resource}
                                    setter={setter}
                                />
                            ) : (
                                <Permissions setter={setter} />
                            ))} */}
                    </div>
                </div>
            )}
        </>
    );
}
