"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { TextArea, Label, ListItem, Select } from "../form/Form";
import { useEffect, useState, useRef } from "react";
import makeUniqueId from "@/app/code/makeUniqueId";
import SourceInput from "../source/sourceInput";
import styles from "./noteInput.module.css";

export default function NoteInput({ availableSources }) {
  const [text, setText] = useState("");
  const [sources, setSources] = useState([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [textError, setTextError] = useState("");
  const [sourceError, setSourceError] = useState("");

  const [loading, setLoading] = useState(false);
  const [uniqueId, setUniqueId] = useState();

  const addSourceRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isSelectOpen && !addSourceRef.current.contains(e.target)) {
        setIsSelectOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isSelectOpen]);

  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (text.length === 0) {
      setTextError("Text cannot be empty");
    }

    if (sources.length === 0) {
      setSourceError("You must add at least one source");
    }

    if (text.length === 0 || sources.length === 0) {
      return;
    }

    const note = { text, sources };

    setLoading(true);

    let response = await fetch("./api/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    setLoading(false);

    setText("");
    setSourceError("");
    setSources([]);
    setText("");

    console.log(await response.json());
  }

  return (
    <div className="centeredContainer">
      <h3>Add a note</h3>
      <div className={styles.form}>
        <TextArea
          id={"text_" + uniqueId}
          required={true}
          onChange={(e) => {
            setText(e.target.value);
            setTextError("");
          }}
          value={text}
          error={textError}
          label={"Text"}
        />
      </div>

      <div className={styles.addSources}>
        <div className={styles.inputContainer}>
          <Label required={true} error={sourceError} label="Current Sources" />

          <ol className={styles.chipGrid}>
            <li
              ref={addSourceRef}
              className={styles.addChip}
              onClick={() => {
                setIsSelectOpen((prev) => !prev);
              }}
            >
              Add a source
              <button className={styles.action} title="Toggle Source List">
                <FontAwesomeIcon icon={faAdd} />
              </button>
              {isSelectOpen && (
                <Select
                  listChoices={availableSources}
                  listChosen={sources}
                  listProperty={"title"}
                  listSetter={setSources}
                />
              )}
              {/* {isSelectOpen && (
                <div
                  className={`${styles.sourcePicker} thinScroller`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {availableSources.map((src) => (
                    <div
                      className={
                        sources.find((x) => x._id === src._id)
                          ? styles.selected
                          : ""
                      }
                      key={src._id}
                      onClick={() => {
                        if (!sources.find((x) => x._id === src._id)) {
                          setSources([...sources, src]);
                          setSourceError("");
                        } else {
                          setSources(sources.filter((x) => x._id !== src._id));
                        }
                      }}
                    >
                      {src.title}
                    </div>
                  ))}

                  {availableSources.length === 0 && (
                    <div className={styles.noSources}>
                      <p>You have no sources</p>
                    </div>
                  )}
                </div>
              )} */}
            </li>

            {sources.length > 0 &&
              sources.map((src) => (
                <ListItem
                  key={src._id}
                  link={src.url}
                  item={src.title}
                  action={() =>
                    setSources(sources.filter((x) => x._id !== src._id))
                  }
                  actionType={"delete"}
                />
              ))}
          </ol>
        </div>

        <details>
          <summary>Create a new source</summary>
          <SourceInput />
        </details>
      </div>

      <button onClick={handleSubmit} className="submitButton">
        {loading ? "Sending..." : "Submit Note"}
      </button>
    </div>
  );
}
