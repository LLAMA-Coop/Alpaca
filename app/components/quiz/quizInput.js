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

  const [choices, setChoices] = useState([]);
  const [newChoice, setNewChoice] = useState("");
  const [choicesError, setChoicesError] = useState('');

  const [sources, setSources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [sourcesError, setSourcesError] = useState('');

  const [loading, setLoading] = useState(false);

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

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
      setResponsesError("Need at least one correct response")
      cannotSend = true;
    }

    if (sources.length === 0 && notes.length === 0) {
      setSourcesError("Need at least one note or source");
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
    setTypeError('');

    setPrompt("");
    setPromptError('');

    setResponses([]);
    setNewResponse("");
    setResponsesError('');

    setChoices([]);
    setNewChoice("");
    setChoicesError('');

    setSources([]);
    setNotes([]);
    setSourcesError('');

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
      <div className={styles.form}>
        <div className={styles.flexContainer}>
          <div>
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
              <>
                <Input
                id={"addChoice_" + uniqueId}
                  label="Add a choice"
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
                      action={() => setChoices(prev => prev.filter(x => x !== res))}
                    />
                  ))}

                  {choices.length === 0 && (
                    <ListItem
                      item={'No responses added yet'}
                    />
                  )}
                </ul>
              </>
            )}
          </div>

          <div>
            <Input
            id={"addCorrect_" + uniqueId}
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
              {responses.map((res) => (
                <ListItem
                  key={res}
                  item={res}
                  actionType={"delete"}
                  action={() => setResponses(prev => prev.filter(x => x !== res))}
                />
              ))}

              {responses.length === 0 && (
                <ListItem
                  item={'No responses added yet'}
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
          {/* <label htmlFor={"sourceOptions_" + uniqueId}>
            Select from a list of sources
          </label> */}
          <Input
          label="Select from a list of sources"
            id={"sourceOptions_" + uniqueId}
            // list={"sourceList_" + uniqueId}
            type="select"
            choices={availableSources.map(src => {
              return { value: src._id, label: src.title}
            })}
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
          {/* <datalist id={"sourceList_" + uniqueId}>
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
          </datalist> */}

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
          {/* <label htmlFor={"noteOptions_" + uniqueId}>
            Select from a list of notes
          </label> */}
          <Input
            id={"noteOptions_" + uniqueId}
            // list={"noteList_" + uniqueId}
            type="select"
            label="Select from a list of notes"
            choices={availableNotes.map(note => {
              return {value: note._id, label: note.text}
            })}
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
          {/* <datalist id={"noteList_" + uniqueId}>
            {availableNotes.map((note) => {
              if (notes.indexOf(note) !== -1) return;
              return (
                <option key={note._id} value={note._id} label={note.text} />
              );
            })}
          </datalist> */}

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
