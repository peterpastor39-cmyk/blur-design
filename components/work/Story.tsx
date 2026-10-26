"use client";
import { useId, useState } from "react";

// Wolff Olins-style collapsed story: the opening paragraph reads on its own, the rest is opt-in.
export default function Story({ paragraphs }: { paragraphs: string[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const [first, ...rest] = paragraphs;
  return <div className="cs-story">
    <p>{first}</p>
    {rest.length > 0 && <>
      <div id={id} className={`cs-story-more${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div>{rest.map(p => <p key={p}>{p}</p>)}</div>
      </div>
      <button type="button" className="cs-story-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        {open ? "Show less" : "Read the story"} <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
    </>}
  </div>;
}
