"use client";

import {
  NoteDisplay,
  MasoneryList,
  QuizDisplay,
  SourceDisplay,
} from "@/app/components/client";
import { useState } from "react";

export default function StudyList({ resources, type, heading }) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <h2>{heading}</h2>
      <button
        className="button primary"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Hide" : "Show"}
      </button>
      {resources.length === 0 && <p>None available for selected tag.</p>}
      {open && (
        <MasoneryList>
          {resources.map((res) => {
            if (type === "note") return <NoteDisplay key={res.id} note={res} />;

            if (type === "quiz") return <QuizDisplay key={res.id} quiz={res} />;

            if (type === "source")
              return <SourceDisplay key={res.id} source={res} />;
          })}
        </MasoneryList>
      )}
    </section>
  );
}
