"use client";

import { useEffect, useState, useRef } from "react";
import {
    Input,
    Label,
    ListItem,
    InputPopup,
    Spinner,
    Alert,
    UserInput,
} from "@components/client";
import PermissionsInput from "../form/PermissionsInput";
import { serializeOne } from "@/lib/db";
import { useStore, useModals } from "@/store/store";
import { buildPermissions } from "@/lib/permissions";
import { DeletePopup } from "../delete-popup/DeletePopup";
import ListAdd from "../form/ListAdd";
import MAX from "@/lib/max";
import BlankableInput from "./BlankableInput";

export function QuizInput({ quiz }) {
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

    const [hints, setHints] = useState([]);
    const [newHint, setNewHint] = useState([]);

    const [courses, setCourses] = useState([]);

    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");

    const [permissions, setPermissions] = useState({});

    const [sources, setSources] = useState([]);
    const [sourcesError, setSourcesError] = useState("");
    const [notes, setNotes] = useState([]);
    const [notesError, setNotesError] = useState("");

    const [isSourceSelectOpen, setIsSourceSelectOpen] = useState(false);
    const [isNoteSelectOpen, setIsNoteSelectOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    const availableSources = useStore((state) => state.sourceStore);
    const availableNotes = useStore((state) => state.noteStore);
    const availableCourses = useStore((state) => state.courseStore);

    const user = useStore((state) => state.user);
    const canDelete = quiz && user && quiz.createdBy === user._id;

    const addModal = useModals((state) => state.addModal);
    const removeModal = useModals((state) => state.removeModal);

    useEffect(() => {
        if (!quiz) return;
        if (quiz.type) setType(quiz.type);
        if (quiz.prompt) setPrompt(quiz.prompt);
        if (quiz.choices) {
            setChoices([...quiz.choices]);
        }
        if (quiz.correctResponses) {
            setResponses([...quiz.correctResponses]);
        }
        if (quiz.hints) {
            setHints([...quiz.hints]);
        }
        if (quiz.sources) {
            setSources(
                quiz.sources.map((srcId) =>
                    availableSources.find((x) => x._id === srcId),
                ),
            );
        }
        if (quiz.notes) {
            setNotes(
                quiz.notes.map((noteId) =>
                    availableNotes.find((x) => x._id === noteId),
                ),
            );
        }
        if (quiz.courses) {
            setCourses(
                quiz.courses.map((courseId) =>
                    availableCourses.find((x) => x._id === courseId),
                ),
            );
        }
        if (quiz.tags && quiz.tags.length > 0) setTags([...quiz.tags]);
        if (quiz.permissions) {
            setPermissions(serializeOne(quiz.permissions));
        }
    }, []);

    const addSourceRef = useRef(null);
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                isSourceSelectOpen &&
                !addSourceRef.current?.contains(e.target)
            ) {
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

    useEffect(() => {
        if (sources.length > 0 || notes.length > 0) {
            setSourcesError("");
            setNotesError("");
        }
    }, [sources, notes]);

    useEffect(() => {
        if (type === "multiple-choice") {
            responses.forEach((response) => {
                if (!choices.includes(response)) {
                    setChoices((prev) => [...prev, response]);
                }
            });
        }
    }, [type, choices, responses, prompt]);

    const types = [
        { label: "Prompt/Response", value: "prompt-response" },
        { label: "Multiple Choice", value: "multiple-choice" },
        { label: "Fill in the Blank", value: "fill-in-the-blank" },
        { label: "Ordered List Answer", value: "ordered-list-answer" },
        { label: "Unordered List Answer", value: "unordered-list-answer" },
        { label: "Verbatim", value: "verbatim" },
    ];

    function handleAddHint(e) {
        e.preventDefault();
        if (!newHint || hints.includes(newHint)) return;
        setHints([...hints, newHint]);
        setNewHint("");
    }

    function handleAddTag(e) {
        e.preventDefault();
        if (!newTag || tags.includes(newTag)) return;
        setTags([...tags, newTag]);
        setNewTag("");
    }

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

        const quizPayload = {
            type: type,
            prompt: prompt,
            choices: choices,
            correctResponses: responses,
            hints: hints,
            sources: sources.map((src) => src._id),
            notes: notes.map((nt) => {
                console.log(nt);
                return nt ?? nt._id;
            }),
            courses: courses.map((course) => course._id),
            tags,
        };
        if (quiz && quiz._id) {
            quizPayload._id = quiz._id;
        }

        quizPayload.permissions = buildPermissions(permissions);

        setLoading(true);

        console.log(quizPayload);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/quiz`,
            {
                method: quiz && quiz._id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(quizPayload),
            },
        );

        setLoading(false);

        if (response.status === 201) {
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

            setRequestStatus({
                success: true,
                message: "Quiz created successfully",
            });
            setShowAlert(true);
        } else if (response.status === 200) {
            setRequestStatus({
                success: true,
                message: "Quiz updated successfully",
            });
            setShowAlert(true);
        } else if (response.status === 401) {
            setRequestStatus({
                success: false,
                message: "You have been signed out. Please sign in again.",
            });
            setShowAlert(true);
            addModal({
                title: "Sign back in",
                content: <UserInput onSubmit={removeModal} />,
            });
        } else {
            setRequestStatus({
                success: false,
                message: `Failed to create quiz`,
            });
            setShowAlert(true);
        }
    }

    function handleAddResponse(e) {
        e.preventDefault();
        const answer = newResponse.trim();

        if (!answer || responses.includes(answer)) {
            return;
        }

        if (type === "verbatim") {
            setResponses(newResponse.split(" "));
            setResponsesError("");
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
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />

            <Input
                type={"select"}
                label="Type"
                choices={types}
                description={"Type of quiz question"}
                required={true}
                value={type}
                error={typeError}
                onChange={(e) => setType(e.target.value)}
            />

            {type === "fill-in-the-blank" ? (
                <BlankableInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    promptError={promptError}
                    setPromptError={setPromptError}
                    responses={responses}
                    setResponses={setResponses}
                />
            ) : (
                <Input
                    label={"Prompt"}
                    type={type === "verbatim" ? "textarea" : "text"}
                    description={
                        "Question prompt. Can be a question or statement"
                    }
                    required={true}
                    value={prompt}
                    maxLength={MAX.prompt}
                    error={promptError}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                        setPromptError("");
                    }}
                />
            )}

            {type === "multiple-choice" && (
                <div>
                    <Input
                        label="Add new choice"
                        description={"Add a new choice. Press enter to add"}
                        value={newChoice}
                        maxLength={MAX.response}
                        required={choices.length < 1}
                        onSubmit={handleAddChoice}
                        error={choicesError}
                        onChange={(e) => setNewChoice(e.target.value)}
                        action="Add new choice"
                        onActionTrigger={handleAddChoice}
                    />

                    <div style={{ marginTop: "24px" }}>
                        <Label label="Choices" />
                        <ul className="chipList">
                            {choices.map((res, index) => (
                                <ListItem
                                    key={index}
                                    item={res}
                                    actionType={"delete"}
                                    action={() => {
                                        setResponses((prev) =>
                                            prev.filter((x) => x !== res),
                                        );
                                        setChoices((prev) =>
                                            prev.filter((x) => x !== res),
                                        );
                                    }}
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
                    type={type === "verbatim" ? "textarea" : "text"}
                    choices={choices.map((x) => ({ label: x, value: x }))}
                    label="Add new answer"
                    description={"Add a new answer. Press enter to add"}
                    value={newResponse}
                    maxLength={
                        type !== "verbatim" ? MAX.response : MAX.description
                    }
                    required={responses.length === 0}
                    onSubmit={handleAddResponse}
                    error={responsesError}
                    onChange={(e) => {
                        setNewResponse(e.target.value);
                        if (type === "multiple-choice") {
                            setNewChoice(e.target.value);
                        }
                    }}
                    action={type !== "multiple-choice" && "Add new answer"}
                    onActionTrigger={(e) => {
                        handleAddResponse(e);
                        if (type === "multiple-choice") {
                            handleAddChoice(e);
                        }
                    }}
                />

                <div style={{ marginTop: "24px" }}>
                    <Label label="Answers" />

                    <ol className="chipList">
                        {responses.map((res, index) => (
                            <ListItem
                                key={index}
                                item={res}
                                actionType={"delete"}
                                action={() =>
                                    setResponses((prev) =>
                                        prev.filter((x) => x !== res),
                                    )
                                }
                            />
                        ))}

                        {responses.length === 0 && (
                            <ListItem item={"No answers added yet"} />
                        )}
                    </ol>
                </div>
            </div>

            <div>
                <Label
                    required={true}
                    error={sourcesError}
                    label="Related Sources"
                />

                <ListAdd
                    item="Add a source"
                    listChoices={availableSources}
                    listChosen={sources}
                    listProperty={"title"}
                    listSetter={setSources}
                />
            </div>

            <div>
                <Label
                    required={true}
                    error={notesError}
                    label="Related Notes"
                />

                <ListAdd
                    item="Add a note"
                    listChoices={availableNotes}
                    listChosen={notes}
                    listProperty={["title", "text"]}
                    listSetter={setNotes}
                />
            </div>

            <div>
                <Label required={false} label="Courses" />

                <ListAdd
                    item="Add a course"
                    listChoices={availableCourses}
                    listChosen={courses}
                    listProperty={"name"}
                    listSetter={setCourses}
                />
            </div>

            <div>
                <Input
                    label={"Add Hint"}
                    value={newHint}
                    maxLength={MAX.response}
                    description="A hint that may help the user remember the correct answer"
                    onChange={(e) => setNewHint(e.target.value)}
                    action="Add hint"
                    onActionTrigger={handleAddHint}
                />

                <div style={{ marginTop: "24px" }}>
                    <Label label="Hints" />

                    <ul className="chipList">
                        {hints.length === 0 && (
                            <ListItem item="No hints added" />
                        )}

                        {hints.map((hint) => (
                            <ListItem
                                key={hint}
                                item={hint}
                                action={() => {
                                    setHints(hints.filter((h) => h !== hint));
                                }}
                                actionType={"delete"}
                            />
                        ))}
                    </ul>
                </div>
            </div>

            <div>
                <Input
                    label={"Add Tag"}
                    value={newTag}
                    maxLength={MAX.tag}
                    description="A word or phrase that could be used to search for this note"
                    autoComplete="off"
                    onChange={(e) => setNewTag(e.target.value)}
                    action="Add tag"
                    onActionTrigger={handleAddTag}
                />

                <div style={{ marginTop: "24px" }}>
                    <Label label="Tags" />

                    <ul className="chipList">
                        {tags.length === 0 && <ListItem item="No tags added" />}

                        {tags.map((tag) => (
                            <ListItem
                                key={tag}
                                item={tag}
                                action={() => {
                                    setTags(tags.filter((t) => t !== tag));
                                }}
                                actionType={"delete"}
                            />
                        ))}
                    </ul>
                </div>
            </div>

            {(!quiz || quiz.createdBy === user?._id.toString()) && (
                <PermissionsInput
                    permissions={quiz ? quiz.permissions : {}}
                    setter={setPermissions}
                />
            )}

            <div className="buttonContainer">
                <InputPopup type="source" />
                <InputPopup type="note" />
            </div>

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Quiz"}
            </button>

            {canDelete && (
                <DeletePopup resourceType="quiz" resourceId={quiz._id} />
            )}
        </form>
    );
}
