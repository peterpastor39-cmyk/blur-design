"use client";
import { useEffect, useRef, useState } from "react";
import AsciiReveal from "./AsciiReveal";


const services = [
  { name: "Brand identity", line: "Marks and visual systems shaped around your story.", image: "billboard", title: "Billboard", about: "An outdoor identity system made to be read at speed, at any distance." },
  { name: "Product design", line: "Interfaces for complex products, from wireframe to final UI.", image: "sonar-dashboard", title: "Sonar", about: "A trading platform where dense on-chain data reads as calm, clear decisions." },
  { name: "Brand systems", line: "Guidelines that help the work grow with you.", image: "tendr", title: "Tendr", about: "Skincare packaging shaped by raw stone and warm light." },
  { name: "Websites & decks", line: "Considered pages and presentations for key moments.", image: "knox-locker", title: "Knox Locker", about: "A mark for a smart-locker company, sketched by hand before it was drawn on screen." },
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
  return <section className="services" aria-label="How we work">
    <div className="services-intro">
      <AsciiReveal as="h2" className={`services-title`}>A small team, close to the work.</AsciiReveal>
      <p className="services-body">Every engagement is led and delivered by Blur’s core team. The designers who shape the initial direction remain with the project through each stage, so the thinking, the craft, and the standard stay consistent from the first conversation to the final system.</p>
    </div>
    <ul className="services-list" ref={list} onPointerLeave={() => setActive(null)}>
      {services.map((s, i) => <li key={s.name} className={`services-row${active === i ? " is-active" : ""}`} onPointerEnter={() => setActive(i)}>
        <span className="services-name">{s.name}</span><span className="services-line">{s.line}</span>
      </li>)}
      <li className="services-card" ref={card} data-on={active !== null ? "true" : undefined} aria-hidden="true">
        {services.map((s, i) => <div key={s.name} className="services-slide" data-on={active === i}>
          <img src={`/hero-images/${s.image}.webp`} alt="" loading="lazy" decoding="async" />
          <div className="services-card-text"><strong>{s.title}</strong><p>{s.about}</p></div>
        </div>)}
      </li>
    </ul>
  </section>;
}
