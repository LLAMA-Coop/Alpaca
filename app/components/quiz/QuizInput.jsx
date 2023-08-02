"use client";

import { Input, Label, ListItem, Select, InputPopup } from "@/app/components/client";
import { useEffect, useState, useRef } from "react";
import makeUniqueId from "@/app/code/uniqueId";

export function QuizInput({ isEditing, availableSources, availableNotes }) {
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

  const [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  const addSourceRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isSourceSelectOpen && !addSourceRef.current?.contains(e.target)) {
        setIsSourceSelectOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
  }, [isSourceSelectOpen]);

  const addNoteRef = useRef(null);
  useEffect(() => {
    if (!addNoteRef.current) return;

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
    { label: "List Answer", value: "list-answer" },
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
    <form className="formGrid">
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

          <div style={{ marginTop: "24px" }}>
            <Label label="Choices" />
            <ul className="chipList">
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
                <ListItem item={"No choices added yet"} />
              )}
            </ul>
          </div>
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

        <div style={{ marginTop: "24px" }}>
          <Label label="Answers" />
          <ul className="chipList">
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
              <ListItem item={"No answers added yet"} />
            )}
          </ul>
        </div>
      </div>

      <div>
        <Label required={true} error={sourcesError} label="Current Sources" />

        <ol className="chipList">
          <ListItem
            item="Add a source"
            action={() => {
              setIsSourceSelectOpen((prev) => !prev);
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

      <div>
        <Label required={true} error={notesError} label="Current Notes" />

        <ol className="chipList">
          <ListItem
            item="Add a source"
            action={() => {
              setIsNoteSelectOpen((prev) => !prev);
            }}
            actionType={"add"}
            select={
              <Select
                listChoices={availableNotes}
                listChosen={notes}
                listProperty={"text"}
                listSetter={setNotes}
              />
            }
          />

          {notes.length > 0 &&
            notes.map((note) => (
              <ListItem
                key={note._id}
                item={note.text}
                action={() => setNotes(notes.filter((x) => x._id !== note._id))}
                actionType={"delete"}
              />
            ))}
        </ol>
      </div>

      <div className="buttonContainer">
        <InputPopup type="source" />
        <InputPopup type="note" />
      </div>

      <button onClick={handleSubmit} className="button submit">
        {loading ? "Sending..." : "Submit Quiz"}
      </button>
    </form>
  );
}
