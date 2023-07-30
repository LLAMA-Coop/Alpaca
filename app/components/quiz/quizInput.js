"use client";

import { Input, Label, ListItem } from "../form/Form";
import SourceInput from "../source/sourceInput";
import makeUniqueId from "@/app/code/uniqueId";
import styles from "./quizInput.module.css";
import { useEffect, useState } from "react";
import NoteInput from "../note/noteInput";
import Link from "next/link";

export default function QuizInput({
  isEditing,
  availableSources,
  availableNotes,
}) {
  const [type, setType] = useState("prompt-response");
  const [typeError, setTypeError] = useState('');

  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState('');

  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState("");
  const [responsesError, setResponsesError] = useState('');

  const [sources, setSources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [sourcesError, setSourcesError] = useState('');

  const [loading, setLoading] = useState(false);

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    // Will need to have an error modal and validation state
    let cannotSend = false;
    if (type === "") {
      setTypeError("Invalid type selected");
      cannotSend = true;
    }

    if (prompt === "") {
      setPromptError("Prompt cannot be empty");
      cannotSend = true;
    }

    if (responses.length === 0) {
      setResponsesError("Need at least one correct response")
      cannotSend = true;
    }

    if (sources.length === 0 && notes.length === 0) {
      setSourcesError("Need at least one note or source");
      cannotSend = true;
    }

    if (cannotSend) {
      return;
    }

    let quiz = {
      type,
      prompt,
      correctResponses: responses,
    };
    if (sources.length > 0) {
      quiz.sources = sources;
    }
    if (notes.length > 0) {
      quiz.notes = notes;
    }

    setLoading(true);

    let response = await fetch("./api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quiz),
    });

    setLoading(false);

    console.log(await response.json());
  }

  function handleAddResponse(e) {
    e.preventDefault();

    let answer = newResponse.trim();

    if (!answer || responses.indexOf(answer) !== -1) {
      return;
    }

    setResponses([...responses, answer]);
    setNewResponse("");
    setResponsesError("");
  }

  function handleDeleteResponse(index) {
    return function (event) {
      event.preventDefault();
      setResponses([
        ...responses.slice(0, index),
        ...responses.slice(index + 1),
      ]);
    };
  }

  const types = [
    { label: "Prompt/Response", value: "prompt-response" },
    { label: "Multiple Choice", value: "multiple-choice" },
  ];

  return (
    <div className="centeredContainer">
      <h3>Add new quiz card</h3>
      <div className={styles.form}>
        <div className={styles.flexContainer}>
          <div>
            <Input
              type={"select"}
              choices={types}
              required={true}
              label="Type"
              value={type}
              error={typeError}
              onChange={(e) => setType(e.target.value)}
            />

            <Input
              required={true}
              label="Prompt"
              value={prompt}
              error={promptError}
              onChange={(e) => {
                setPrompt(e.target.value);
                setPromptError("");
              }}
            />
          </div>

          <div>
            <Input
              label="Add a correct response"
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

            <Label label="Correct Responses" />
            <ul className="chipGrid">
              {responses.map((res, index) => (
                <ListItem
                  key={index}
                  item={res}
                  actionType={"delete"}
                  action={handleDeleteResponse(index)}
                />
              ))}

              {responses.length === 0 && (
                <ListItem
                  item={'No responses added yet.'}
                />
              )}
            </ul>
          </div>
        </div>

        {sources.length > 0 ? (
          <div>
            <p>Current Sources</p>
            <ul>
              {sources.map((srcId) => {
                const source = availableSources.find((x) => x._id === srcId);

                return (
                  <li key={source._id}>
                    <Link href={source.url} target="_blank">
                      {source.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div>No Sources Added</div>
        )}

        <details>
          <summary>Add Another Source</summary>
          <label htmlFor={"sourceOptions_" + uniqueId}>
            Select from a list of sources
          </label>
          <input
            id={"sourceOptions_" + uniqueId}
            list={"sourceList_" + uniqueId}
            onChange={(e) => {
              let newSource = availableSources.find(
                (x) => x._id === e.target.value
              );
              if (newSource) {
                setSources((arr) => {
                  return [...arr, newSource._id];
                });
              }
              e.target.value = "";
            }}
          />

          {/* MDN raises accessibility concerns about <datalist>. May consider different option. */}
          <datalist id={"sourceList_" + uniqueId}>
            {availableSources.map((src) => {
              if (sources.indexOf(src._id) !== -1) return;
              return (
                <option
                  key={src._id}
                  value={src._id}
                  label={src.title}
                ></option>
              );
            })}
          </datalist>

          <details>
            <summary>Add New Source</summary>
            <SourceInput></SourceInput>
          </details>
        </details>

        {notes.length > 0 ? (
          <div>
            <p>Current Notes</p>
            <ul>
              {notes.map((note) => {
                return <li key={note._id}>{note.text}</li>;
              })}
            </ul>
          </div>
        ) : (
          <div>
            <p>No Notes Added</p>
          </div>
        )}

        <details>
          <summary>Add Another Note</summary>
          <label htmlFor={"noteOptions_" + uniqueId}>
            Select from a list of notes
          </label>
          <input
            id={"noteOptions_" + uniqueId}
            list={"noteList_" + uniqueId}
            onChange={(e) => {
              let newNote = availableNotes.find(
                (x) => x._id === e.target.value
              );
              if (newNote && notes.indexOf(newNote) === -1) {
                setNotes([...notes, newNote]);
              }
              e.target.value = "";
            }}
          />

          {/* MDN raises accessibility concerns about <datalist>. May consider different option. */}
          <datalist id={"noteList_" + uniqueId}>
            {availableNotes.map((note) => {
              if (notes.indexOf(note) !== -1) return;
              return (
                <option key={note._id} value={note._id} label={note.text} />
              );
            })}
          </datalist>

          <div>
            Add New Note
            <NoteInput availableSources={availableSources}></NoteInput>
          </div>
        </details>

        <button onClick={handleSubmit} className="submitButton">
          {loading ? "Sending..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
