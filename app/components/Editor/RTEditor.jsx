"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useRef } from "react";
import styles from "./RTEditor.module.css";
import { highlight } from "prismjs";

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
      <div className={styles.toolbar}>
        <button
          className="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <b>Bold</b>
        </button>
        <button
          className="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <i>Italic</i>
        </button>
        <button
          className="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
        >
          {" "}
          <u>Underline</u>
        </button>
        <button
          className="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHighlight({ color: highlightInputRef.current.value })
              .run()
          }
          disabled={!editor.can().chain().focus().toggleHighlight().run()}
        >
          <mark>Highlight</mark>
        </button>
        <label>
          <input
            type="color"
            id="highlightcolor"
            defaultValue="#ffff00"
            ref={highlightInputRef}
          />
        </label>
        <div className="!pickertext">Highlight Color</div>
      </div>

      {/* Editor Component */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
