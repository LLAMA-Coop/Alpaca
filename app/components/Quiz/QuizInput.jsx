"use client";

import { PermissionsDisplay } from "../Form/PermissionsDisplay";
import { useStore, useModals, useAlerts } from "@/store/store";
import { DeletePopup } from "../DeletePopup/DeletePopup";
import { buildPermissions, permissionsListToObject } from "@/lib/permissions";
import { useEffect, useState, useRef } from "react";
import { Validator } from "@/lib/validation";
import styles from "./QuizInput.module.css";
import { validation } from "@/lib/validation";
import {
    Input,
    Label,
    ListItem,
    InputPopup,
    Spinner,
    ListAdd,
    BlankableInput,
    UserInput,
} from "@client";

export function QuizInput({ quiz }) {
    const [errors, setErrors] = useState({});

    const [type, setType] = useState("prompt-response");
    const [prompt, setPrompt] = useState("");
    const [responses, setResponses] = useState([]);
    const [newResponse, setNewResponse] = useState("");
    const [choices, setChoices] = useState([]);
    const [newChoice, setNewChoice] = useState("");
    const [hints, setHints] = useState([]);
    const [newHint, setNewHint] = useState([]);
    const [courses, setCourses] = useState([]);
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");
    const [permissions, setPermissions] = useState({});
    const [sources, setSources] = useState([]);
    const [notes, setNotes] = useState([]);
    const [isSourceSelectOpen, setIsSourceSelectOpen] = useState(false);
    const [isNoteSelectOpen, setIsNoteSelectOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const availableSources = useStore((state) => state.sources);
    const availableCourses = useStore((state) => state.courses);
    const availableTags = useStore((state) => state.tags);
    const addTags = useStore((state) => state.addTags);
    const availableNotes = useStore((state) => state.notes);

    const user = useStore((state) => state.user);

    const addModal = useModals((state) => state.addModal);
    const removeModal = useModals((state) => state.removeModal);
    const addAlert = useAlerts((state) => state.addAlert);

    const canDelete =
        quiz &&
        user &&
        (quiz.createdBy === user.id || quiz.creator?.id === user.id);
    const canChangePermissions =
        !quiz ||
        (user && (quiz.createdBy === user.id || quiz.creator?.id === user.id));

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
        if (quiz.notes) {
            setNotes(
                quiz.notes.map((noteId) =>
                    availableNotes.find((x) => x.id === noteId),
                ),
            );
        }
        if (quiz.courses) {
            setCourses(
                quiz.courses.map((courseId) =>
                    availableCourses.find((x) => x.id === courseId),
                ),
            );
        }
        if (quiz.sources) {
            setSources(
                quiz.sources.map((src) => {
                    const source = availableSources.find(
                        (x) => x.id === src.id,
                    );
                    return {
                        id: src.id,
                        title: source.title,
                        locInSource: src.locInSource,
                        locType: src.locType,
                    };
                }),
            );
        }
        if (quiz.tags && quiz.tags.length > 0) setTags([...quiz.tags]);
        if (quiz.permissions) {
            const settingPermissions = permissionsListToObject(
                quiz.permissions,
            );
            console.log("SETTING PERMISSIONS", settingPermissions);
            setPermissions(settingPermissions);
        }
    }, []);

    useEffect(() => {
        if (!quiz || sources.length === 0) return;
        if (
            quiz.sources &&
            !(quiz.sourceReferences && quiz.sourceReferences.length)
        ) {
            setSources(
                quiz.sources.map((src) => {
                    let source = availableSources.find((x) => x.id === src);
                    if (!source) {
                        source = {
                            title: "unavailable",
                            id: src.id,
                        };
                    }
                    return source;
                }),
            );
        }
    }, [availableSources]);

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
            setErrors((prev) => ({
                ...prev,
                sources: "",
                notes: "",
            }));
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
        if (!availableTags.includes(newTag)) {
            addTags(newTag);
        }
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
        if (loading) return;

        const validator = new Validator();

        validator.validateAll([
            {
                field: "type",
                value: type,
                type: "quiz",
            },
            {
                field: "prompt",
                value: prompt,
                type: "quiz",
            },
        ]);

        if (responses.length === 0) {
            validator.addError({
                field: "answers",
                message: "Need at least one answer",
            });
        }

        if (sources.length === 0 && notes.length === 0) {
            validator.addError({
                field: "sources",
                message: "Need one note or source",
            });

            validator.addError({
                field: "notes",
                message: "Need one note or source",
            });
        }

        if (type === "multiple-choice" && choices.length === 0) {
            validator.addError({
                field: "choices",
                message: "Need at least one choice",
            });
        }

        if (!validator.isValid) {
            setErrors(validator.errors);

            return addAlert({
                success: false,
                message: validator.getErrorsAsString(),
            });
        }

        const quizPayload = {
            type: type,
            prompt: prompt.trim(),
            choices: choices,
            correctResponses: responses,
            hints: hints,
            sources: sources.map((src) => ({
                resourceId: quiz.id ? quiz.id : undefined,
                resourceType: "quiz",
                sourceId: src.id,
                locInSource: "unknown",
                locType: "page",
            })),
            notes: notes.map((nt) => nt.id),
            courses: courses.map((course) => course.id),
            tags,
        };

        if (quiz && quiz.id) {
            quizPayload.id = quiz.id;
        }

        quizPayload.permissions = buildPermissions(
            permissions,
            quiz ? quiz.id : null,
            "quiz",
        );

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/quiz`,
            {
                method: quiz && quiz.id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(quizPayload),
            },
        );

        setLoading(false);

        if (response.status === 201) {
            setPrompt("");
            setResponses([]);
            setNewResponse("");

            setChoices([]);
            setNewChoice("");

            setSources([]);
            setNotes([]);

            addAlert({
                success: true,
                message: "Quiz created successfully",
            });
        } else if (response.status === 200) {
            addAlert({
                success: true,
                message: "Quiz updated successfully",
            });
        } else if (response.status === 401) {
            addAlert({
                success: false,
                message: "You have been signed out. Please sign in again.",
            });
            addModal({
                title: "Sign back in",
                content: <UserInput onSubmit={removeModal} />,
            });
        } else {
            const json = await response.json();
            addAlert({
                success: false,
                message: json.message,
            });
        }
    }

    function handleAddResponse(e) {
        e.preventDefault();
        const answer = newResponse.trim();

        if (!answer || responses.includes(answer)) {
            return;
        }

        if (type === "verbatim") {
            return setResponses(newResponse.split(" "));
        }

        setResponses([...responses, answer]);
        setNewResponse("");
        setErrors((prev) => ({ ...prev, answers: "" }));
    }

    function handleAddChoice(e) {
        e.preventDefault();

        const choice = newChoice.trim();
        if (!choice || choices.includes(choice)) {
            return;
        }

        setChoices([...choices, choice]);
        setNewChoice("");
        setErrors((prev) => ({ ...prev, choices: "" }));
    }

    return (
        <form className={styles.form}>
            <Input
                type={"select"}
                label="Type"
                choices={types}
                description={"Type of quiz question"}
                required={true}
                value={type}
                error={errors.type}
                onChange={(e) => setType(e.target.value)}
            />

            {type === "fill-in-the-blank" ? (
                <BlankableInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    promptError={errors.prompt}
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
                    maxLength={validation.quiz.prompt.maxLength}
                    error={errors.prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                        setErrors((prev) => ({ ...prev, prompt: "" }));
                    }}
                />
            )}

            {type === "multiple-choice" && (
                <div className={styles.multipleChoice}>
                    <Input
                        label="Add new choice"
                        description={"Add a new choice. Press enter to add"}
                        value={newChoice}
                        maxLength={validation.quiz.choice.maxLength}
                        required={choices.length < 1}
                        onSubmit={handleAddChoice}
                        error={errors.choices}
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

            {type !== "fill-in-the-blank" && (
                <div className={styles.answer}>
                    <Input
                        type={type === "verbatim" ? "textarea" : "text"}
                        choices={choices.map((x) => ({ label: x, value: x }))}
                        label="Add new answer"
                        description={"Add a new answer. Press enter to add"}
                        value={newResponse}
                        maxLength={
                            type !== "verbatim"
                                ? validation.quiz.choice
                                : validation.quiz.prompt
                        }
                        required={responses.length === 0}
                        onSubmit={handleAddResponse}
                        error={errors.answers}
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
            )}

            <div className={styles.links}>
                <div className={styles.sources}>
                    <Label
                        required={true}
                        error={errors.sources}
                        label="Related Sources"
                    />

                    <ListAdd
                        item="Add a source"
                        listChoices={availableSources}
                        listChosen={sources}
                        listProperty={"title"}
                        listSetter={setSources}
                        createNew={<InputPopup type="source" />}
                        type="datalist"
                        messageIfNone="No sources added"
                    />
                </div>

                <div className={styles.notes}>
                    <Label
                        required={true}
                        error={errors.notes}
                        label="Related Notes"
                    />

                    <ListAdd
                        item="Add a note"
                        listChoices={availableNotes}
                        listChosen={notes}
                        listProperty={["title", "text"]}
                        listSetter={setNotes}
                        createNew={<InputPopup type="note" />}
                        type="datalist"
                        messageIfNone="No notes added"
                    />
                </div>
            </div>

            <div className={styles.courses}>
                <Label required={false} label="Courses" />

                <ListAdd
                    item="Add to a course"
                    listChoices={availableCourses}
                    listChosen={courses}
                    listProperty={"name"}
                    listSetter={setCourses}
                    type="datalist"
                    messageIfNone="Not added to any course"
                />
            </div>

            <div className={styles.permissions}>
                <PermissionsDisplay permissions={permissions} />

                {canChangePermissions && (
                    <InputPopup
                        type="permissions"
                        resource={permissions}
                        setter={setPermissions}
                    />
                )}
            </div>

            <div className={styles.advanced}>
                <h4>Advanced</h4>
                <div className={styles.hints}>
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

                    <Input
                        label={"Add Hint"}
                        value={newHint}
                        maxLength={validation.quiz.hint.maxLength}
                        description="A hint that may help the user remember the correct answer"
                        onChange={(e) => setNewHint(e.target.value)}
                        action="Add hint"
                        onActionTrigger={handleAddHint}
                    />
                </div>

                <div className={styles.tags}>
                    {/* <Label label="Tags" />

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
                    </ul> */}

                    <Input
                        type="datalist"
                        choices={availableTags}
                        label={"Add Tag"}
                        value={newTag}
                        maxLength={validation.misc.tag.maxLength}
                        description="A word or phrase that could be used to search for this note"
                        autoComplete="off"
                        onChange={(e) => setNewTag(e.target.value)}
                        action="Add tag"
                        onActionTrigger={handleAddTag}
                        placeholder="Quiz Tags"
                    />
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

                    {/* <div style={{ marginTop: "24px" }}>
                        <Label label="Tags" />

                        <ul className="chipList">
                            {tags.length === 0 && (
                                <ListItem item="No tags added" />
                            )}

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
                    </div> */}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className={`button submit ${styles.submit}`}
            >
                {loading ? <Spinner /> : "Submit Quiz"}
            </button>

            {canDelete && (
                <DeletePopup resourceType="quiz" resourceId={quiz.id} />
            )}
        </form>
    );
}
