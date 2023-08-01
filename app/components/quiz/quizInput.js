"use client";

import { Input, Label, ListItem, Details, Select } from "../form/Form";
import SourceInput from "../source/sourceInput";
import makeUniqueId from "@/app/code/uniqueId";
import styles from "./quizInput.module.css";
import { useEffect, useState, useRef } from "react";
import NoteInput from "../note/noteInput";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import InputPopup from "../inputPopup/InputPopup";

export default function QuizInput({
  isEditing,
  availableSources,
  availableNotes,
}) {
  const [type, setType] = useState("prompt-response");
  const [typeError, setTypeError] = useState("");

  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState("");

  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState("");
  const [responsesError, setResponsesError] = useState("");

  const [choices, setChoices] = useState([]);
  const [newChoice, setNewChoice] = useState("");
  const [choicesError, setChoicesError] = useState("");

  const [sources, setSources] = useState([]);
  const [sourcesError, setSourcesError] = useState("");
  const [notes, setNotes] = useState([]);
  const [notesError, setNotesError] = useState("");

  const [isSourceSelectOpen, setIsSourceSelectOpen] = useState(false);
  const [isNoteSelectOpen, setIsNoteSelectOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  const addSourceRef = useRef(null);
  useEffect(() => {
    if (!addSourceRef.current) return;

    const handleOutsideClick = (e) => {
      if (isSourceSelectOpen && !addSourceRef.current.contains(e.target)) {
        setIsSourceSelectOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
  }, [isSourceSelectOpen]);

  const addNoteRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isNoteSelectOpen && !addNoteRef.current.contains(e.target)) {
        setIsNoteSelectOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
  }, [isNoteSelectOpen]);

  const types = [
    { label: "Prompt/Response", value: "prompt-response" },
    { label: "Multiple Choice", value: "multiple-choice" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    let cannotSend = false;
    if (!types.find((x) => x.value === type)) {
      setTypeError("Invalid type selected");
      cannotSend = true;
    }

    if (prompt === "") {
      setPromptError("Prompt cannot be empty");
      cannotSend = true;
    }

    if (responses.length === 0) {
      setResponsesError("Need at least one answer");
      cannotSend = true;
    }

    if (sources.length === 0 && notes.length === 0) {
      setSourcesError("Need one note or source");
      setNotesError("Need one note or source");
      cannotSend = true;
    }

    if (type === "multiple-choice" && choices.length === 0) {
      setChoicesError("Need at least one choice");
      cannotSend = true;
    }

    if (cannotSend) {
      return;
    }

    const quiz = {
      type: type,
      prompt: prompt,
      choices: choices,
      correctResponses: responses,
    };

    quiz.sources = sources;
    quiz.notes = notes;

    setLoading(true);

    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quiz),
    }).then((res) => res.json());

    console.log(response);

    setType("prompt-response");
    setTypeError("");

    setPrompt("");
    setPromptError("");

    setResponses([]);
    setNewResponse("");
    setResponsesError("");

    setChoices([]);
    setNewChoice("");
    setChoicesError("");

    setSources([]);
    setNotes([]);
    setSourcesError("");
    setNotesError("");

    setLoading(false);
  }

  function handleAddResponse(e) {
    e.preventDefault();

    const answer = newResponse.trim();

    if (!answer || responses.includes(answer)) {
      return;
    }

    setResponses([...responses, answer]);
    setNewResponse("");
    setResponsesError("");
  }

  function handleAddChoice(e) {
    e.preventDefault();

    const choice = newChoice.trim();

    if (!choice || choices.includes(choice)) {
      return;
    }

    setChoices([...choices, choice]);
    setNewChoice("");
    setChoicesError("");
  }

  return (
    <div className="centeredContainer">
      <h3>Add new quiz card</h3>

      <div className={styles.container}>
        <Input
          id={"quizType_" + uniqueId}
          type={"select"}
          choices={types}
          required={true}
          label="Type"
          value={type}
          error={typeError}
          onChange={(e) => setType(e.target.value)}
        />

        <Input
          id={"prompt_" + uniqueId}
          required={true}
          label="Prompt"
          value={prompt}
          error={promptError}
          onChange={(e) => {
            setPrompt(e.target.value);
            setPromptError("");
          }}
        />

        {type === "multiple-choice" && (
          <div>
            <Input
              id={"addChoice_" + uniqueId}
              label="Add new choice"
              value={newChoice}
              required={choices.length < 1}
              onSubmit={handleAddChoice}
              error={choicesError}
              onChange={(e) => setNewChoice(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleAddChoice(e);
                }
              }}
            />

            <Label label="Choices" />
            <ul className="chipGrid">
              {choices.map((res) => (
                <ListItem
                  key={res}
                  item={res}
                  actionType={"delete"}
                  action={() =>
                    setChoices((prev) => prev.filter((x) => x !== res))
                  }
                />
              ))}

              {choices.length === 0 && (
                <ListItem item={"No responses added yet"} />
              )}
            </ul>
          </div>
        )}

        <div>
          <Input
            id={"addCorrect_" + uniqueId}
            label="Add new answer"
            value={newResponse}
            required={responses.length === 0}
            onSubmit={handleAddResponse}
            error={responsesError}
            onChange={(e) => setNewResponse(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleAddResponse(e);
              }
            }}
          />

          <Label label="Answers" />
          <ul className="chipGrid">
            {responses.map((res) => (
              <ListItem
                key={res}
                item={res}
                actionType={"delete"}
                action={() =>
                  setResponses((prev) => prev.filter((x) => x !== res))
                }
              />
            ))}

            {responses.length === 0 && (
              <ListItem item={"No responses added yet"} />
            )}
          </ul>
        </div>

        <div>
          <Label required={true} error={sourcesError} label="Current Sources" />

          <ol className={styles.chipGrid}>
            <li
              ref={addSourceRef}
              className={styles.addChip}
              onClick={() => {
                setIsSourceSelectOpen((prev) => !prev);
              }}
            >
              Add a source
              <button className={styles.action} title="Toggle Source List">
                <FontAwesomeIcon icon={faAdd} />
              </button>
              {isSourceSelectOpen && (
                <Select
                  listChoices={availableSources}
                  listChosen={sources}
                  listProperty={"title"}
                  listSetter={setSources}
                />
              )}
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

        <div>
          <Label required={true} error={notesError} label="Current Notes" />

          <ol className={styles.chipGrid}>
            <li
              ref={addNoteRef}
              className={styles.addChip}
              onClick={() => {
                setIsNoteSelectOpen((prev) => !prev);
              }}
            >
              Add a note
              <button className={styles.action} title="Toggle Note List">
                <FontAwesomeIcon icon={faAdd} />
              </button>
              {isNoteSelectOpen && (
                <Select
                  listChoices={availableNotes}
                  listChosen={notes}
                  listProperty={"text"}
                  listSetter={setNotes}
                />
              )}
            </li>

            {notes.length > 0 &&
              notes.map((note) => (
                <ListItem
                  key={note._id}
                  item={note.text}
                  action={() =>
                    setNotes(notes.filter((x) => x._id !== note._id))
                  }
                  actionType={"delete"}
                />
              ))}
          </ol>
        </div>

        <div className={styles.buttonContainer}>
          <InputPopup type="source" />
          <InputPopup type="note" />
        </div>

        <button onClick={handleSubmit} className="submitButton">
          {loading ? "Sending..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
