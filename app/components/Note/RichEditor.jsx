"use client";

import { useState } from "react";
import styles from "./RichEditor.module.css";

const ToolbarButton = ({ icon, title, onClick, isActive = false }) => (
    <button
        className={`${styles.toolbarBtn} ${isActive ? styles.active : ""}`}
        title={title}
        onClick={onClick}
        type="button"
    >
        {icon}
    </button>
);

export function RichNoteEditor({ value = "", onChange, placeholder = "Start writing..." }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const insertMarkdown = (before, after = "") => {
        const textarea = document.getElementById("rich-editor");
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const newText =
            value.substring(0, start) +
            before +
            selectedText +
            after +
            value.substring(end);
        onChange({ target: { value: newText } });
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
        }, 0);
    };

    return (
        <div className={`${styles.editor} ${isExpanded ? styles.expanded : ""}`}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon="B"
                        title="Bold"
                        onClick={() => insertMarkdown("**", "**")}
                    />
                    <ToolbarButton
                        icon="I"
                        title="Italic"
                        onClick={() => insertMarkdown("*", "*")}
                    />
                    <ToolbarButton
                        icon="U"
                        title="Underline"
                        onClick={() => insertMarkdown("__", "__")}
                    />
                </div>

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon="##"
                        title="Heading"
                        onClick={() => insertMarkdown("## ", "\n")}
                    />
                    <ToolbarButton
                        icon="•"
                        title="Bullet List"
                        onClick={() => insertMarkdown("• ", "\n")}
                    />
                    <ToolbarButton
                        icon="1."
                        title="Numbered List"
                        onClick={() => insertMarkdown("1. ", "\n")}
                    />
                </div>

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon="[ ]"
                        title="Checkbox"
                        onClick={() => insertMarkdown("- [ ] ", "\n")}
                    />
                    <ToolbarButton
                        icon="`"
                        title="Code"
                        onClick={() => insertMarkdown("`", "`")}
                    />
                    <ToolbarButton
                        icon="```"
                        title="Code Block"
                        onClick={() => insertMarkdown("```\n", "\n```")}
                    />
                </div>

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon=">"
                        title="Quote"
                        onClick={() => insertMarkdown("> ", "")}
                    />
                    <ToolbarButton
                        icon="---"
                        title="Divider"
                        onClick={() => insertMarkdown("\n---\n", "")}
                    />
                </div>

                <div className={styles.spacer} />

                <ToolbarButton
                    icon={isExpanded ? "✕" : "⛶"}
                    title={isExpanded ? "Exit fullscreen" : "Fullscreen"}
                    onClick={() => setIsExpanded(!isExpanded)}
                />
            </div>

            <textarea
                id="rich-editor"
                className={styles.textarea}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />

            <div className={styles.helperText}>
                Supports Markdown formatting. Use **bold**, *italic*, `code` and more.
            </div>
        </div>
    );
}

export function RichNotePreview({ content }) {
    const formatContent = (text) => {
        return text
            .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
            .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
            .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
            .replace(/^\> (.*?)$/gm, "<blockquote>$1</blockquote>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/__(.*?)__/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/`(.*?)`/g, "<code>$1</code>")
            .replace(/\n/g, "<br/>");
    };

    return (
        <div
            className={styles.preview}
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
    );
}
