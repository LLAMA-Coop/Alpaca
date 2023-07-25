"use client";
import makeUniqueId from "@/app/code/uniqueId";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
// import NoteDisplay from "../note/noteDisplay";
// import Note from "@/app/api/models/Note";
// import Source from "@/app/api/models/Source";
import NoteInput from "../note/noteInput";
import SourceInput from "../source/sourceInput";

export default function QuizInput({
  isEditing,
  availableSources,
  availableNotes,
}) {
  let [type, setType] = useState("");
  let [prompt, setPrompt] = useState("");
  let [responses, setResponses] = useState([]);
  let [sources, setSources] = useState([]);
  let [notes, setNotes] = useState([]);

  const addResponseRef = useRef();

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    let quiz = {
      type,
      prompt,
      responses,
    };
    if (sources.length > 0) {
      quiz.sources = sources;
    }
    if (notes.length > 0) {
      quiz.notes = notes;
    }

    console.log(quiz);

    // let response = await fetch("./api/quiz", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(quiz),
    // });

    // console.log(await response.json());
  }

  function handleAddResponse(e) {
    e.preventDefault();
    setResponses([...responses, addResponseRef.current.value]);
  }

  const types = [{ label: "Prompt/Response", value: "prompt-response" }];

  return (
    <div>
      <label htmlFor={"type_" + uniqueId}>
        Type:
        <select
          id={"type_" + uniqueId}
          defaultValue={type}
          onChange={(e) => {
            setType(e.target.value);
          }}
        >
          {types.map((t) => {
            return (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            );
          })}
        </select>
      </label>

      <label htmlFor={"prompt_" + uniqueId}>
        Prompt:
        <input
          id={"prompt_" + uniqueId}
          type="text"
          defaultValue={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
        ></input>
      </label>

      <p>Correct Responses</p>
      <ul>
        {responses.map((res, index) => {
          return <li key={index}>{res}</li>;
        })}
        <li>
          <label htmlFor={"response_" + uniqueId}>
            New Correct Response
            <input
              id={"response_" + uniqueId}
              type="text"
              ref={addResponseRef}
            ></input>
            <button onClick={handleAddResponse}>Add Response</button>
          </label>
        </li>
      </ul>

      {sources.length > 0 ? (
        <div>
          <p>Current Sources</p>
          <ul>
            {sources.map((srcId) => {
              const source = availableSources.find((x) => x._id === srcId);

              return (
                <li key={source._id}>
                  <Link href={source.url}>{source.title}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div>No Sources Added</div>
      )}

      <fieldset>
        <legend>Add Another Source</legend>
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
        ></input>

        {/* MDN raises accessibility concerns about <datalist>. May consider different option. */}
        <datalist id={"sourceList_" + uniqueId}>
          {availableSources.map((src) => {
            if (sources.indexOf(src._id) !== -1) return;
            return (
              <option key={src._id} value={src._id} label={src.title}></option>
            );
          })}
        </datalist>

        <div>
          Add New Source
          <SourceInput></SourceInput>
        </div>
      </fieldset>

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

      <fieldset>
        <legend>Add Another Note</legend>
        <label htmlFor={"noteOptions_" + uniqueId}>
          Select from a list of notes
        </label>
        <input
          id={"noteOptions_" + uniqueId}
          list={"noteList_" + uniqueId}
          onChange={(e) => {
            let newNote = availableNotes.find((x) => x._id === e.target.value);
            if (newNote && notes.indexOf(newNote) === -1) {
              setNotes([...notes, newNote]);
            }
            e.target.value = "";
          }}
        ></input>

        {/* MDN raises accessibility concerns about <datalist>. May consider different option. */}
        <datalist id={"noteList_" + uniqueId}>
          {availableNotes.map((note) => {
            if (notes.indexOf(note) !== -1) return;
            return (
              <option
                key={note._id}
                value={note._id}
                label={note.text}
              ></option>
            );
          })}
        </datalist>

        <div>
          Add New Note
          <NoteInput availableSources={availableSources}></NoteInput>
        </div>
      </fieldset>

      <button onClick={handleSubmit}>Submit Quiz</button>
    </div>
  );
}
