"use client";
import { useEffect, useRef } from "react";
import { Cormorant_Garamond } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], display: "swap" });

const more = [
  { image: "business-cards", name: "Sonar identity", discipline: "Print", year: "2025" },
  { image: "sonar-mobile", name: "Sonar mobile", discipline: "Mobile app", year: "2026" },
  { image: "sonar-mark", name: "Sonar mark", discipline: "Logo", year: "2025" },
];

// Breaker between case study and services: 3 staggered projects + a cut-off "see all" exit tile.
// Images sit blurred and come into focus on hover.
export default function MoreWork() {
  const track = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    // Vertical wheel stays page scroll; only drag / trackpad-x moves the row.
    let down = false, sx = 0, sl = 0;
    const start = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; down = true; sx = e.clientX; sl = t.scrollLeft; t.classList.add("is-drag"); };
    const move = (e: PointerEvent) => { if (down) t.scrollLeft = sl - (e.clientX - sx); };
    const end = () => { down = false; t.classList.remove("is-drag"); };
    t.addEventListener("pointerdown", start);
    addEventListener("pointermove", move);
    addEventListener("pointerup", end);
    return () => { t.removeEventListener("pointerdown", start); removeEventListener("pointermove", move); removeEventListener("pointerup", end); };
  }, []);
  return <section className="more-work" aria-label="More work">
    <h2 className={`more-title ${serif.className}`}>Other things <em>we’ve made.</em></h2>
    <ol className="more-track" ref={track}>
      {more.map((p, i) => <li key={p.name} className="more-card">
        <span className="more-count">{String(i + 1).padStart(2, "0")} / 04</span>
        <div className="more-media"><img src={`/hero-images/${p.image}.webp`} alt="" draggable={false} /></div>
        <p className="more-caption">{p.name} <span className={serif.className}>— <em>{p.discipline}, {p.year}</em></span></p>
      </li>)}
      <li className="more-card more-exit">
        <span className="more-count">04 / 04</span>
        <a href="#work" className={`more-media ${serif.className}`} draggable={false}>See all work <span aria-hidden="true">→</span></a>
      </li>
    </ol>
  </section>;
}
