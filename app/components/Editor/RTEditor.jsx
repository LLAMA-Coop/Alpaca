"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@client";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import styles from "./RTEditor.module.css";
import Link from "@tiptap/extension-link";
import { useRef, useState } from "react";

export default function RTEditor({ content, setContent }) {
    const [fullscreen, setFullscreen] = useState(false);
    const highlightInputRef = useRef(null);

    const editor = useEditor({
        content,
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({
                placeholder: "Your note",
            }),
            Link.configure({
                openOnClick: true,
                autolink: true,
                defaultProtocol: "https",
                protocols: ["http", "https"],
                isAllowedUri: (url, ctx) => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(":")
                            ? new URL(url)
                            : new URL(`${ctx.defaultProtocol}://${url}`);

                        // use default validation
                        if (!ctx.defaultValidate(parsedUrl.href)) {
                            return false;
                        }

                        // disallowed protocols
                        const disallowedProtocols = ["ftp", "file", "mailto"];
                        const protocol = parsedUrl.protocol.replace(":", "");

                        if (disallowedProtocols.includes(protocol)) {
                            return false;
                        }

                        // only allow protocols specified in ctx.protocols
                        const allowedProtocols = ctx.protocols.map((p) =>
                            typeof p === "string" ? p : p.scheme
                        );

                        if (!allowedProtocols.includes(protocol)) {
                            return false;
                        }

                        // disallowed domains
                        const disallowedDomains = [];
                        const domain = parsedUrl.hostname;

                        if (disallowedDomains.includes(domain)) {
                            return false;
                        }

                        // all checks have passed
                        return true;
                    } catch {
                        return false;
                    }
                },
                shouldAutoLink: (url) => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(":")
                            ? new URL(url)
                            : new URL(`https://${url}`);

                        // only auto-link if the domain is not in the disallowed list
                        const disallowedDomains = [];
                        const domain = parsedUrl.hostname;

                        return !disallowedDomains.includes(domain);
                    } catch {
                        return false;
                    }
                },
            }),
        ],
        onUpdate: ({ editor }) => {
            setContent.dispatch({ type: setContent.type, value: editor.getHTML() });
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className={`${styles.editor} ${fullscreen ? styles.fullscreen : ""}`}>
            <div>
                <div className={styles.toolbar}>
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                disabled={!editor.can().chain().focus().toggleBold().run()}
                            >
                                <b>B</b>
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Bold Selected Text</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                disabled={!editor.can().chain().focus().toggleItalic().run()}
                            >
                                <i>I</i>
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Italicize Selected Text</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                            >
                                {" "}
                                <u>U</u>
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Underline Selected Text</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                type="button"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHighlight({ color: highlightInputRef.current.value })
                                        .run()
                                }
                                disabled={!editor.can().chain().focus().toggleHighlight().run()}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    fill="none"
                                    height="20"
                                    width="20"
                                >
                                    <path d="M11 7l6 6" />
                                    <path d="M4 16l11.7 -11.7a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4l-11.7 11.7h-4v-4z" />
                                </svg>
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Highlight Selected Text</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                type="button"
                                onClick={() => highlightInputRef.current?.click()}
                                style={{ backgroundColor: highlightInputRef.current?.value }}
                            />
                        </TooltipTrigger>

                        <TooltipContent>Change highlight color</TooltipContent>
                    </Tooltip>

                    <label
                        htmlFor="highlightcolor"
                        className={styles.colorSelect}
                    >
                        Change highlight color
                        <input
                            type="color"
                            tabIndex={-1}
                            id="highlightcolor"
                            defaultValue="#ffff00"
                            ref={highlightInputRef}
                        />
                    </label>
                </div>

                <Tooltip>
                    <TooltipTrigger>
                        <button
                            type="button"
                            className={styles.fullscreenButton}
                            onClick={() => setFullscreen((prev) => !prev)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                fill="none"
                                height="24"
                                width="24"
                            >
                                {fullscreen ? (
                                    <>
                                        <path d="M4 8v-2c0 -.551 .223 -1.05 .584 -1.412" />
                                        <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                                        <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                                        <path d="M16 20h2c.545 0 1.04 -.218 1.4 -.572" />
                                        <path d="M3 3l18 18" />
                                    </>
                                ) : (
                                    <>
                                        <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                                        <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                                        <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                                        <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                                    </>
                                )}
                            </svg>
                        </button>
                    </TooltipTrigger>

                    <TooltipContent>Toggle Fullscreen</TooltipContent>
                </Tooltip>
            </div>

            {/* Editor Component */}
            <EditorContent
                editor={editor}
                className={styles.editorContent}
            />
        </div>
    );
}
