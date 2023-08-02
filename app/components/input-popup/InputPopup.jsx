"use client";

import { SourceInput, NoteInput } from "@/app/components/client";
import { useEffect, useRef, useState } from "react";
import styles from "./InputPopup.module.css";

export function InputPopup({ type }) {
  const [showPopup, setShowPopup] = useState(false);
  const popup = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!showPopup) return;
      if (popup.current && !popup.current.contains(e.target)) {
        setShowPopup(false);
        document.documentElement.style.overflowY = "auto";
        document.documentElement.style.paddingRight = "0px";
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showPopup]);

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
        <div className={styles.popup}>
          <div ref={popup}>
            <div>
              <h4>
                {type === "source" && "Create new source"}
                {type === "note" && "Create new note"}
              </h4>

              <button
                type="button"
                onClick={() => {
                  setShowPopup(false);
                  document.documentElement.style.overflowY = "auto";
                  document.documentElement.style.paddingRight = "0px";
                }}
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

            {type === "source" && <SourceInput />}
            {type === "note" && <NoteInput />}
          </div>
        </div>
      )}
    </>
  );
}
