"use client";

import { useState } from "react";

export function Details({ summary, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={isOpen ? "open" : ""}>
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        {summary}
      </button>

      <div>{isOpen && children}</div>
    </div>
  );
}
