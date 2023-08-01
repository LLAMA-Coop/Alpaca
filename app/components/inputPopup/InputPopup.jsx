"use client";

import SourceInput from "../source/sourceInput";
import styles from "./InputPopup.module.css";
import NoteInput from "../note/noteInput";
import { useEffect, useRef, useState } from "react";

const InputPopup = ({ type }) => {
  const [showPopup, setShowPopup] = useState(false);
  const popup = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!showPopup) return;
      if (popup.current && !popup.current.contains(e.target)) {
        setShowPopup(false);
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
        onClick={() => setShowPopup((prev) => !prev)}
        className="blue submitButton"
      >
        {typeContent[type]}
      </button>

      {showPopup && (
        <div className={styles.popup}>
          <div ref={popup}>
            {type === "source" && <SourceInput />}
            {type === "note" && <NoteInput />}
          </div>
        </div>
      )}
    </>
  );
};

export default InputPopup;
