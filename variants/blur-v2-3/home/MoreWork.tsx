"use client";
import { useEffect, useId, useRef } from "react";


const more = [
  { image: "business-cards", name: "Sonar identity", discipline: "Print", year: "2025" },
  { image: "sonar-mobile", name: "Sonar mobile", discipline: "Mobile app", year: "2026" },
  { image: "sonar-mark", name: "Sonar mark", discipline: "Logo", year: "2025" },
];

// Scroll-in: the image resolves out of blurred static — noise and blur settle to 0 as it fades up.
const PEAK = 90, BLUR = 24, DURATION = 1500, STAGGER = 450;
function NoiseIn({ src, delay }: { src: string; delay: number }) {
  const id = useId().replace(/:/g, "");
  const img = useRef<HTMLImageElement>(null);
  const noise = useRef<SVGFETurbulenceElement>(null);
  const map = useRef<SVGFEDisplacementMapElement>(null);
  useEffect(() => {
    const el = img.current, n = noise.current, m = map.current;
    if (!el || !n || !m) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.style.opacity = "1"; el.style.filter = "none"; return; }
    let frame = 0, timer = 0;
    const set = (p: number) => {
      const k = 1 - (1 - p) ** 3;
      m.setAttribute("scale", String(PEAK * (1 - k)));
      n.setAttribute("seed", String(Math.floor(p * 40)));
      el.style.opacity = String(Math.min(1, p * 1.6));
      el.style.filter = `url(#${id}) blur(${(BLUR * (1 - k)).toFixed(2)}px)`;
    };
    const play = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / DURATION);
        set(p);
        if (p < 1) frame = requestAnimationFrame(tick); else el.style.filter = "none";
      };
      frame = requestAnimationFrame(tick);
    };
    const reset = () => { cancelAnimationFrame(frame); clearTimeout(timer); set(0); };
    reset();
    // Plays each time the card enters; re-arms once it has fully left the viewport.
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= .25) timer = window.setTimeout(play, delay);
      else if (!e.isIntersecting) reset();
    }, { threshold: [0, .25] });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [id, delay]);
  return <>
    <svg className="noise-defs" aria-hidden="true"><filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence ref={noise} type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n" />
      <feDisplacementMap ref={map} in="SourceGraphic" in2="n" scale={PEAK} xChannelSelector="R" yChannelSelector="G" />
    </filter></svg>
    <img ref={img} src={src} alt="" draggable={false} />
  </>;
}

// Breaker between case study and services: 3 staggered projects + a cut-off "see all" exit tile.
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
    // Cards resolve one by one: counts and captions follow their image's stagger; re-arms off-screen.
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= .25) t.classList.add("is-in");
      else if (!e.isIntersecting) t.classList.remove("is-in");
    }, { threshold: [0, .25] });
    io.observe(t);
    return () => { io.disconnect(); t.removeEventListener("pointerdown", start); removeEventListener("pointermove", move); removeEventListener("pointerup", end); };
  }, []);
  return <section className="more-work" aria-label="More work">
    <ol className="more-track" ref={track}>
      {more.map((p, i) => <li key={p.name} className="more-card" style={{ "--i": i } as React.CSSProperties}>
        <span className="more-count">{String(i + 1).padStart(2, "0")} / 04</span>
        <div className="more-media"><NoiseIn src={`/hero-images/${p.image}.webp`} delay={i * STAGGER} /></div>
        <p className="more-caption">{p.name} <span>— <em>{p.discipline}, {p.year}</em></span></p>
      </li>)}
      <li className="more-card more-exit" style={{ "--i": more.length } as React.CSSProperties}>
        <span className="more-count">04 / 04</span>
        <a href="#work" className={`more-media`} draggable={false}>See all work <span aria-hidden="true">→</span></a>
      </li>
    </ol>
  </section>;
}
