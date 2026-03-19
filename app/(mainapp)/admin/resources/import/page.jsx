"use client";

import { useState } from "react";
import styles from "./ImportResources.module.css";
import styles2 from "@/app/(mainapp)/page.module.css";
import { CourseSelector } from "./CourseSelector";
import { CSVUploader } from "./CSVUploader";

export default function ImportResourcesPage() {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [importStatus, setImportStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImportSuccess = (data) => {
        setImportStatus({
            type: "success",
            message: `Successfully created and added ${data.resourcesCreated} resources to ${selectedCourse.name}`,
            details: data,
        });
        setIsLoading(false);
    };

    const handleImportError = (error) => {
        setImportStatus({
            type: "error",
            message: error.message,
            details: error.details,
        });
        setIsLoading(false);
    };

    return (
        <main className={styles2.main}>
            <header>
                <h1>Bulk Import Resources</h1>
                <p>Create and add multiple resources to a course using CSV</p>
            </header>

            <section>
                <div className={styles.content}>
                    <CourseSelector
                        selectedCourse={selectedCourse}
                        onSelectCourse={setSelectedCourse}
                    />

                    {selectedCourse && (
                        <>
                            <CSVUploader
                                courseId={selectedCourse.id}
                                courseName={selectedCourse.name}
                                onSuccess={handleImportSuccess}
                                onError={handleImportError}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                            />

                            {importStatus && (
                                <div className={`${styles.status} ${styles[importStatus.type]}`}>
                                    <div className={styles.statusHeader}>
                                        <h3>
                                            {importStatus.type === "success" ? "✅ Success" : "❌ Error"}
                                        </h3>
                                        <button
                                            className={styles.closeButton}
                                            onClick={() => setImportStatus(null)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p className={styles.message}>{importStatus.message}</p>
                                    {importStatus.details && (
                                        <details className={styles.details}>
                                            <summary>Details</summary>
                                            <pre>{JSON.stringify(importStatus.details, null, 2)}</pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <ResourceGuides />
                        </>
                    )}

                    {!selectedCourse && (
                        <div className={styles.noSelection}>
                            <p>Select a course above to get started</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

function ResourceGuides() {
    return (
        <div className={styles.guides}>
            <div className={styles.section}>
                <h2>Import Guides</h2>
                <div className={styles.guideCards}>
                    <GuideCard
                        title="Notes"
                        description="Create and import study notes"
                        format={{
                            columns: ["resourceType", "title", "text", "tags"],
                            example:
                                "note,Python Fundamentals,Variables are containers for storing data values. Python uses dynamic typing.,python|basics|fundamentals",
                        }}
                    />
                    <GuideCard
                        title="Sources"
                        description="Import learning sources"
                        format={{
                            columns: [
                                "resourceType",
                                "title",
                                "medium",
                                "url",
                                "authors",
                                "tags",
                            ],
                            example:
                                "source,Real Python - Decorators,article,https://realpython.com/decorators-in-python,Real Python,python|advanced",
                        }}
                    />
                    <GuideCard
                        title="Quizzes"
                        description="Create and import quizzes (requires an existing source or note ID)"
                        format={{
                            columns: [
                                "resourceType",
                                "type",
                                "prompt",
                                "answers",
                                "hints",
                                "tags",
                                "linkedSourceId",
                            ],
                            example:
                                "quiz,prompt-response,What is a variable?,A container for storing data,Think of it as a box,python|basics,42",
                        }}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <h2>CSV Format Details</h2>
                <FormatDetails />
            </div>

            <div className={styles.section}>
                <h2>Use AI to Generate Resources</h2>
                <AIPromptGuide />
            </div>
        </div>
    );
}

function GuideCard({ title, description, format }) {
    return (
        <div className={styles.guideCard}>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className={styles.formatBox}>
                <div className={styles.columns}>
                    <strong>Columns:</strong> {format.columns.join(" → ")}
                </div>
                <div className={styles.example}>
                    <strong>Example:</strong>
                    <pre>{format.example}</pre>
                </div>
            </div>
        </div>
    );
}

function FormatDetails() {
    return (
        <div className={styles.formatDetails}>
            <div className={styles.resourceType}>
                <h4>📝 Note</h4>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <strong>resourceType</strong>
                            </td>
                            <td>Always: "note"</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>title</strong>
                            </td>
                            <td>Title of the note (string)</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>text</strong>
                            </td>
                            <td>Content of the note (can be multi-line in CSV)</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>tags</strong>
                            </td>
                            <td>Pipe-separated tags (e.g. python|basics)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className={styles.resourceType}>
                <h4>📚 Source</h4>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <strong>resourceType</strong>
                            </td>
                            <td>Always: "source"</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>title</strong>
                            </td>
                            <td>Title of the source (string)</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>medium</strong>
                            </td>
                            <td>article | book | video | podcast | website | audio</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>url</strong>
                            </td>
                            <td>Link to the source</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>authors</strong>
                            </td>
                            <td>Pipe-separated author names</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>tags</strong>
                            </td>
                            <td>Pipe-separated tags</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className={styles.resourceType}>
                <h4>🎯 Quiz</h4>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <strong>resourceType</strong>
                            </td>
                            <td>Always: "quiz"</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>type</strong>
                            </td>
                            <td>
                                prompt-response | multiple-choice | fill-in-the-blank |
                                ordered-list-answer | unordered-list-answer | verbatim
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>prompt</strong>
                            </td>
                            <td>The question</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>answers</strong>
                            </td>
                            <td>
                                For multiple-choice: pipe-separated options (first is correct).
                                For other types: pipe-separated answers.
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>hints</strong>
                            </td>
                            <td>Pipe-separated hints (optional, can be empty)</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>tags</strong>
                            </td>
                            <td>Pipe-separated tags</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>linkedSourceId</strong>
                            </td>
                            <td>ID of an existing source to link (required unless linkedNoteId provided)</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>linkedNoteId</strong>
                            </td>
                            <td>ID of an existing note to link (alternative to linkedSourceId)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AIPromptGuide() {
    return (
        <div className={styles.promptGuide}>
            <div className={styles.promptBox}>
                <h4>Generate Notes CSV</h4>
                <p className={styles.promptText}>
                    Use this prompt with ChatGPT/Claude to generate notes:
                </p>
                <pre>{`Generate a CSV with study notes about [TOPIC].
Format (with NO extra text):
resourceType,title,text,tags
note,Topic1,Detailed explanation,tag1|tag2
note,Topic2,Another explanation,tag1|tag3

Generate 10 rows with realistic study notes.`}</pre>
            </div>

            <div className={styles.promptBox}>
                <h4>Generate Sources CSV</h4>
                <p className={styles.promptText}>
                    Use this prompt with ChatGPT/Claude to generate sources:
                </p>
                <pre>{`Generate a CSV with learning sources about [TOPIC].
Format (with NO extra text):
resourceType,title,medium,url,authors,tags
source,Title,article,https://example.com,Author Name,tag1|tag2

Mediums can be: article, book, video, podcast, website, audio
Generate 10 rows with realistic sources.`}</pre>
            </div>

            <div className={styles.promptBox}>
                <h4>Generate Quizzes CSV</h4>
                <p className={styles.promptText}>
                    Use this prompt with ChatGPT/Claude to generate quizzes:
                </p>
                <pre>{`Generate a CSV with quiz questions about [TOPIC].
Format (with NO extra text):
resourceType,type,prompt,answers,hints,tags,linkedSourceId
quiz,prompt-response,Question?,Correct answer,Hint,tag1|tag2,[SOURCE_ID]
quiz,multiple-choice,Question?,Correct|Wrong1|Wrong2|Wrong3,Hint,tag1,[SOURCE_ID]

Types: prompt-response, multiple-choice, fill-in-the-blank
For multiple-choice, first answer is the correct one.
Replace [SOURCE_ID] with the ID of an existing source.
Generate 10 rows with realistic quizzes.`}</pre>
            </div>
        </div>
    );
}
