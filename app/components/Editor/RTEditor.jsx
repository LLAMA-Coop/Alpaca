"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

export default function RTEditor({ content, setContent }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true, defaultColor: "#ff0" }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const toggleHighlight = () => {
    editor.chain().focus().toggleHighlight().run();
  };

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
          onClick={() => editor.chain().focus().toggleHighlight().run()}
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
      </div>

      {/* Editor Component */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
