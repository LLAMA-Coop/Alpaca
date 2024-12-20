"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useRef } from "react";
import styles from "./RTEditor.module.css";

export default function RTEditor({ content, setContent }) {
  const highlightInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent.dispatch({ type: setContent.type, value: editor.getHTML() });
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div className="editor-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <div
            style={{
              fontSize: "12px",
              padding: "5px 10px",
              backgroundColor: "#111729",
              color: "white",
              margin: "0px",
            }}
          >
            <b>Bold</b>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <div
            style={{
              fontSize: "12px",
              padding: "5px 10px",
              backgroundColor: "#111729",
              color: "white",
              margin: "0px",
            }}
          >
            <i>Italic</i>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
        >
          <div
            style={{
              fontSize: "12px",
              padding: "5px 10px",
              backgroundColor: "#111729",
              color: "white",
              margin: "0px",
            }}
          >
            {" "}
            <u>Underline</u>
          </div>
        </button>
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHighlight({ color: highlightInputRef.current.value })
              .run()
          }
          disabled={!editor.can().chain().focus().toggleHighlight().run()}
        >
          <div
            style={{
              fontSize: "12px",
              padding: "5px 10px",
              backgroundColor: "#111729",
              color: "#111729",
            }}
          >
            <mark>Highlight</mark>
          </div>
        </button>
        <label>
          Change highlight color
          <input
            type="color"
            id="highlightcolor"
            defaultValue="#ffff00"
            ref={highlightInputRef}
          />
        </label>
      </div>

      {/* Editor Component */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
