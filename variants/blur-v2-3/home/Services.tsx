"use client";
import { useEffect, useRef, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400"], display: "swap" });

const services = [
  { name: "Brand Refresh", line: "Stay Relevant. Stay Valuable.", image: "billboard", title: "Billboard", about: "An outdoor identity system built to be read at speed, in any city, at any distance." },
  { name: "Reposition", line: "Don’t Become the Best. Become the Only", image: "sonar-dashboard", title: "Sonar", about: "A trading dashboard that turns dense on-chain data into calm, confident decisions." },
  { name: "Expansion", line: "Don’t Become the Best. Become the Only", image: "tendr", title: "Tendr", about: "Skincare packaging grounded in raw stone and warm light, quiet on the shelf and loud in the hand." },
  { name: "Turnaround", line: "Make Your Next Move Your Turning Point", image: "knox-locker", title: "Knox Locker", about: "A mark for a smart-locker company, sketched by hand before it was ever drawn on screen." },
];

// Working-model list: hovering a row floats a project preview that trails the cursor.
export default function Services() {
  const list = useRef<HTMLUListElement>(null);
  const card = useRef<HTMLLIElement>(null);
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const el = list.current, c = card.current;
    if (!el || !c) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * .16; y += (ty - y) * .16;
      c.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${Math.max(-6, Math.min(6, (tx - x) * .04))}deg)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .1 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!c.dataset.on) { x = tx; y = ty; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", move);
    return () => { el.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return <section className="services" aria-label="Our working model">
    <div className="services-intro">
      <h2 className={`services-title ${serif.className}`}>Our working model is fluid, adapting to both partner and project.</h2>
      <p className="services-body">Jorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Ut diam quam, semper iaculis condimentum ac, vestibulum eu nisl.</p>
    </div>
    <ul className="services-list" ref={list} onPointerLeave={() => setActive(null)}>
      {services.map((s, i) => <li key={s.name} className={`services-row${active === i ? " is-active" : ""}`} onPointerEnter={() => setActive(i)}>
        <span className="services-name">{s.name}</span><span className="services-line">{s.line}</span>
      </li>)}
      <li className="services-card" ref={card} data-on={active !== null ? "true" : undefined} aria-hidden="true">
        {services.map((s, i) => <div key={s.name} className="services-slide" data-on={active === i}>
          <img src={`/hero-images/${s.image}.webp`} alt="" />
          <div className="services-card-text"><strong>{s.title}</strong><p>{s.about}</p></div>
        </div>)}
      </li>
    </ul>
  </section>;
}
