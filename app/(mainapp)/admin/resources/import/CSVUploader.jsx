"use client";

import { useState, useRef } from "react";
import styles from "./CSVUploader.module.css";

const VALID_RESOURCE_TYPES = {
    note: ["resourceType", "title", "text", "tags"],
    source: ["resourceType", "title", "medium", "url", "authors", "tags"],
    quiz: ["resourceType", "type", "prompt", "answers", "hints", "tags"],
};

const QUIZ_TYPES = [
    "prompt-response",
    "multiple-choice",
    "fill-in-the-blank",
    "ordered-list-answer",
    "unordered-list-answer",
    "verbatim",
];

const SOURCE_MEDIUMS = ["article", "book", "video", "podcast", "website", "audio"];

export function CSVUploader({
    courseId,
    courseName,
    onSuccess,
    onError,
    isLoading,
    setIsLoading,
}) {
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState([]);
    const [validationResults, setValidationResults] = useState(null);
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type !== "dragleave" && e.type !== "dragend");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles[0]) {
            setFile(droppedFiles[0]);
            setErrors([]);
            setValidationResults(null);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setErrors([]);
            setValidationResults(null);
        }
    };

    const validateAndParse = async (csvContent) => {
        const lines = csvContent.trim().split("\n");
        if (lines.length < 1) {
            throw new Error("CSV file is empty");
        }

        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = [];
        const validationErrors = [];
        let rowNumber = 2;

        // Determine resource type from headers (all rows should be same type)
        const resourceTypeIndex = headers.indexOf("resourceType");
        if (resourceTypeIndex === -1) {
            throw new Error('CSV must have a "resourceType" column');
        }

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);
            const row = {};

            headers.forEach((header, index) => {
                row[header] = values[index] || "";
            });

            const resourceType = row.resourceType?.toLowerCase();

            try {
                validateRow(row, resourceType, rowNumber);
                rows.push(row);
            } catch (error) {
                validationErrors.push({
                    row: rowNumber,
                    error: error.message,
                });
            }

            rowNumber++;
        }

        if (validationErrors.length > 0) {
            throw new Error(`Validation errors found: ${validationErrors.length} rows failed`);
        }

        return rows;
    };

    const validateRow = (row, resourceType, rowNumber) => {
        if (!resourceType) {
            throw new Error("resourceType is required");
        }

        if (!VALID_RESOURCE_TYPES[resourceType]) {
            throw new Error(
                `Invalid resourceType "${resourceType}". Must be: note, source, or quiz`
            );
        }

        const validColumns = VALID_RESOURCE_TYPES[resourceType];

        for (const col of validColumns) {
            if (col === "resourceType") continue; // already checked
            if (!row[col] || row[col].trim() === "") {
                if (col !== "hints" && col !== "tags") {
                    // hints and tags are optional
                    throw new Error(`Missing required column: ${col}`);
                }
            }
        }

        // Type-specific validation
        if (resourceType === "note") {
            if (!row.title?.trim()) throw new Error("Note title is required");
            if (!row.text?.trim()) throw new Error("Note text is required");
        }

        if (resourceType === "source") {
            if (!row.title?.trim()) throw new Error("Source title is required");
            if (!row.medium?.trim()) throw new Error("Source medium is required");
            if (!SOURCE_MEDIUMS.includes(row.medium?.toLowerCase())) {
                throw new Error(
                    `Invalid medium "${row.medium}". Must be: ${SOURCE_MEDIUMS.join(", ")}`
                );
            }
            if (!row.url?.trim()) throw new Error("Source URL is required");
        }

        if (resourceType === "quiz") {
            if (!row.type?.trim()) throw new Error("Quiz type is required");
            if (!QUIZ_TYPES.includes(row.type?.toLowerCase())) {
                throw new Error(
                    `Invalid quiz type "${row.type}". Must be: ${QUIZ_TYPES.join(", ")}`
                );
            }
            if (!row.prompt?.trim()) throw new Error("Quiz prompt is required");
            if (!row.answers?.trim()) throw new Error("Quiz answers are required");
            if (!row.linkedSourceId?.trim() && !row.linkedNoteId?.trim()) {
                throw new Error(
                    "Quiz requires linkedSourceId or linkedNoteId (ID of an existing source or note)"
                );
            }
        }
    };

    const parseCSVLine = (line) => {
        const result = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    };

    const createNote = async (noteData) => {
        const payload = {
            title: noteData.title,
            text: noteData.text,
            tags: noteData.tags ? noteData.tags.split("|").map((t) => t.trim()) : [],
            sources: [],
            courses: [],
            permissions: {},
        };

        const response = await fetch("/api/note", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`Failed to create note: ${err.message || response.statusText}`);
        }

        const data = await response.json();
        return data.content;
    };

    const createSource = async (sourceData) => {
        const payload = {
            title: sourceData.title,
            medium: sourceData.medium,
            url: sourceData.url,
            authors: sourceData.authors ? sourceData.authors.split("|").map((a) => a.trim()) : [],
            tags: sourceData.tags ? sourceData.tags.split("|").map((t) => t.trim()) : [],
            courses: [],
            publishedAt: null,
            lastAccessed: null,
            permissions: {},
        };

        const response = await fetch("/api/source", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`Failed to create source: ${err.message || response.statusText}`);
        }

        const data = await response.json();
        return data.content;
    };

    const createQuiz = async (quizData) => {
        const linkedSourceId = quizData.linkedSourceId ? parseInt(quizData.linkedSourceId) : null;
        const linkedNoteId = quizData.linkedNoteId ? parseInt(quizData.linkedNoteId) : null;

        const payload = {
            type: quizData.type,
            prompt: quizData.prompt,
            tags: quizData.tags ? quizData.tags.split("|").map((t) => t.trim()) : [],
            hints: quizData.hints && quizData.hints.trim() ? quizData.hints.split("|").map((h) => h.trim()) : [],
            sources: linkedSourceId ? [linkedSourceId] : [],
            notes: linkedNoteId ? [linkedNoteId] : [],
            courses: [],
            permissions: {},
        };

        // Parse answers and choices based on quiz type
        if (quizData.type === "multiple-choice") {
            const allChoices = quizData.answers.split("|").map((c) => c.trim());
            payload.choices = allChoices;
            payload.answers = [allChoices[0]]; // First option is always correct
        } else {
            payload.choices = [];
            payload.answers = quizData.answers.split("|").map((a) => a.trim());
        }

        const response = await fetch("/api/quiz", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`Failed to create quiz: ${err.message || response.statusText}`);
        }

        const data = await response.json();
        return data.content;
    };

    const addResourceToCourse = async (resourceId, resourceType) => {
        // API expects plural array keys: notes, sources, quizzes
        const pluralKey = resourceType === "quiz" ? "quizzes" : resourceType + "s";
        const payload = {
            [pluralKey]: [resourceId],
        };

        const response = await fetch(`/api/course/${courseId}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`Failed to add resource to course: ${err.message || response.statusText}`);
        }

        return response.json();
    };

    const handleUpload = async () => {
        if (!file) {
            setErrors(["Please select a CSV file"]);
            return;
        }

        setIsLoading(true);
        setErrors([]);
        setValidationResults(null);

        try {
            const content = await file.text();
            const rows = await validateAndParse(content);

            if (rows.length === 0) {
                throw new Error("No valid rows found in CSV");
            }

            const createdResources = [];
            const creationErrors = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const resourceType = row.resourceType.toLowerCase();

                try {
                    let createdResource;

                    if (resourceType === "note") {
                        createdResource = await createNote(row);
                    } else if (resourceType === "source") {
                        createdResource = await createSource(row);
                    } else if (resourceType === "quiz") {
                        createdResource = await createQuiz(row);
                    }

                    // Add to course
                    await addResourceToCourse(createdResource.id, resourceType);


                    createdResources.push({
                        rowNumber: i + 2,
                        resourceType,
                        resourceId: createdResource.id,
                        title: row.title || row.prompt,
                    });
                } catch (error) {
                    creationErrors.push({
                        rowNumber: i + 2,
                        resourceType: row.resourceType,
                        error: error.message,
                    });
                }
            }

            const summary = {
                totalRows: rows.length,
                resourcesCreated: createdResources.length,
                errors: creationErrors,
                createdResources,
            };

            if (creationErrors.length > 0) {
                onError({
                    message: `Partially completed: ${createdResources.length}/${rows.length} resources created`,
                    details: summary,
                });
            } else {
                onSuccess(summary);
            }

            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            const errorMsg = error.message || "Unknown error occurred";
            setErrors([errorMsg]);
            onError({
                message: errorMsg,
                details: { file: file?.name },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadBox}>
                <div
                    className={`${styles.dropzone} ${dragActive ? styles.active : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className={styles.icon}>📊</div>
                    <h3>Upload CSV File</h3>
                    <p className={styles.subtitle}>
                        Drag and drop your CSV file here or click to select
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className={styles.hiddenInput}
                        disabled={isLoading}
                    />

                    <button
                        className={styles.selectButton}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                    >
                        Select CSV File
                    </button>
                </div>

                {file && (
                    <div className={styles.fileInfo}>
                        <div className={styles.fileName}>📄 {file.name}</div>
                        <div className={styles.fileSize}>
                            {(file.size / 1024).toFixed(2)} KB
                        </div>
                    </div>
                )}

                {errors.length > 0 && (
                    <div className={styles.errorBox}>
                        <div className={styles.errorTitle}>❌ Errors</div>
                        <ul className={styles.errorList}>
                            {errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {file && !isLoading && (
                    <div className={styles.actions}>
                        <button
                            className={styles.uploadButton}
                            onClick={handleUpload}
                        >
                            Upload & Create Resources
                        </button>
                        <button
                            className={styles.cancelButton}
                            onClick={() => {
                                setFile(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
                                setErrors([]);
                            }}
                        >
                            Clear
                        </button>
                    </div>
                )}

                {isLoading && (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Processing and creating resources...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
