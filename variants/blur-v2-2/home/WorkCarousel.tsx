"use client";

import { useEffect, useRef } from "react";
import AsciiReveal from "./AsciiReveal";

const work = [
  { image: "billboard", name: "Billboard", year: "2026", services: ["Brand Identity Design", "Campaign"], about: "An outdoor identity system built to be read at speed, in any city, at any distance." },
  { image: "sonar-dashboard", name: "Sonar", year: "2026", services: ["Product Design", "Design System"], about: "A trading dashboard that turns dense on-chain data into calm, confident decisions." },
  { image: "knox-locker", name: "Knox Locker", year: "2025", services: ["Brand Identity Design", "Logo"], about: "A mark for a smart-locker company, sketched by hand before it was ever drawn on screen." },
  { image: "tendr", name: "Tendr", year: "2025", services: ["Packaging", "Brand Identity Design"], about: "Skincare packaging grounded in raw stone and warm light, quiet on the shelf and loud in the hand." },
  { image: "business-cards", name: "Sonar identity", year: "2025", services: ["Brand Identity Design", "Print"], about: "Stationery and print that carry Sonar's mark from screen into the physical world." },
  { image: "sonar-mobile", name: "Sonar mobile", year: "2026", services: ["Product Design", "Mobile App"], about: "Sonar's trading tools, rebuilt for the thumb without losing the depth." },
];

// Pinned horizontal gallery: vertical scroll moves full-bleed slides left (Unikorns-style).
export default function WorkCarousel() {
  const track = useRef<HTMLElement>(null);
  const strip = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = track.current, row = strip.current;
    if (!section || !row) return;
    let raf = 0;

    function layout() {
      const travel = Math.max(0, row!.scrollWidth - innerWidth);
      section!.style.height = `${travel + innerHeight}px`;
      update();
    }
    function update() {
      raf = 0;
      const box = section!.getBoundingClientRect();
      const travel = Math.max(0, row!.scrollWidth - innerWidth);
      const p = Math.min(1, Math.max(0, -box.top / Math.max(1, box.height - innerHeight)));
      row!.style.transform = `translate3d(${(-p * travel).toFixed(2)}px,0,0)`;
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

    const resize = new ResizeObserver(layout);
    resize.observe(row);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", layout);
    layout();
    return () => {
      cancelAnimationFrame(raf); resize.disconnect();
      removeEventListener("scroll", schedule); removeEventListener("resize", layout);
    };
  }, []);

  return <section className="story-work" ref={track} aria-label="Selected work">
    <div className="work-stage">
      <ul className="work-strip" ref={strip}>
        {work.map(project => <li key={project.name} className="work-slide">
          <img src={`/hero-images/${project.image}.webp`} alt="" draggable={false} />
          <div className="work-pills">
            <span className="work-pill">{project.year}</span>
            {project.services.map(service => <span key={service} className="work-pill">{service}</span>)}
          </div>
          <div className="work-info">
            <AsciiReveal as="h3" className="work-name">{project.name}</AsciiReveal>
            <p className="work-about">{project.about}</p>
          </div>
        </li>)}
      </ul>
    </div>
  </section>;
}
