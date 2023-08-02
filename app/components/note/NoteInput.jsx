"use client";

import { useEffect, useState, useRef } from "react";
import makeUniqueId from "@/app/code/uniqueId";
import {
  TextArea,
  Label,
  ListItem,
  Select,
  InputPopup,
} from "@/app/components";

export function NoteInput({ availableSources }) {
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
    <form className="formGrid">
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

      <div>
        <Label required={true} error={sourceError} label="Current Sources" />

        <ol className="chipList">
          <ListItem
            item="Add a source"
            action={() => {
              setIsSelectOpen((prev) => !prev);
            }}
            actionType={"add"}
            select={
              <Select
                listChoices={availableSources}
                listChosen={sources}
                listProperty={"title"}
                listSetter={setSources}
              />
            }
          />

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

      <InputPopup type="source" />

      <button onClick={handleSubmit} className="button submit">
        {loading ? "Sending..." : "Submit Note"}
      </button>
    </form>
  );
}
