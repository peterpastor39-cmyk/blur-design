"use client";
import AsciiReveal from "./AsciiReveal";


// Why the studio is called Blur: every idea starts out of focus.
export default function NameStory() {
  return <section className="name-story" aria-label="Why Blur">
    <AsciiReveal as="h2" className={`name-title`}>Every idea starts as <em>a blur.</em></AsciiReveal>
    <p className="name-body">Every brand and product begins without a clear shape: an intention, a direction, a question still forming. Our work is to bring it into focus. Through research, direction, and careful iteration, we give each idea a defined form and a lasting structure, one that holds its clarity long after it leaves our hands.</p>
  </section>;
}
