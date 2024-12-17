"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

export default function RTEditor({ content }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true, defaultColor: "#ff0" }),
    ],
    content,
    immediatelyRender: false,
  });

  if (!editor) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
}
