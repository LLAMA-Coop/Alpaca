"use client";

import {
  NoteDisplay,
  MasoneryList,
  QuizDisplay,
  SourceDisplay,
} from "@/app/components/client";

export default function StudyList({ resources, type, heading }) {
  return (
    <section>
      <h2>{heading}</h2>
      {resources.length === 0 ? (
        <p>No {heading.toLowerCase()} available.</p>
      ) : (
        <MasoneryList>
          {resources.map((res) => {
            if (type === "note") return <NoteDisplay key={res.id} note={res} />;

            if (type === "quiz")
              return (
                <QuizDisplay
                  key={res.id}
                  quiz={res}
                  isFlashcard={true}
                  canClientCheck={true}
                />
              );

            if (type === "source")
              return <SourceDisplay key={res.id} source={res} />;
          })}
        </MasoneryList>
      )}
    </section>
  );
}
