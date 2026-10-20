"use client";

import AsciiReveal from "./AsciiReveal";

const work = [
  { image: "billboard", name: "Billboard", type: "Branding", year: "2026", services: ["Brand Identity Design", "Campaign"], about: "An outdoor identity system built to be read at speed, in any city, at any distance." },
  { image: "sonar-dashboard", name: "Sonar", type: "Website", year: "2026", services: ["Product Design", "Design System"], about: "A trading dashboard that turns dense on-chain data into calm, confident decisions." },
  { image: "knox-locker", name: "Knox Locker", type: "Branding", year: "2025", services: ["Brand Identity Design", "Logo"], about: "A mark for a smart-locker company, sketched by hand before it was ever drawn on screen." },
  { image: "tendr", name: "Tendr", type: "Packaging", year: "2025", services: ["Packaging", "Brand Identity Design"], about: "Skincare packaging grounded in raw stone and warm light, quiet on the shelf and loud in the hand." },
  { image: "business-cards", name: "Sonar identity", type: "Branding", year: "2025", services: ["Brand Identity Design", "Print"], about: "Stationery and print that carry Sonar's mark from screen into the physical world." },
  { image: "sonar-mobile", name: "Sonar mobile", type: "Mobile App", year: "2026", services: ["Product Design", "Mobile App"], about: "Sonar's trading tools, rebuilt for the thumb without losing the depth." },
  { image: "sonar-mark", name: "Sonar mark", type: "Branding", year: "2026", services: ["Logo", "Brand Identity Design"], about: "A single glyph that has to hold up from favicon to billboard." },
  { image: "tendr", name: "Tendr campaign", type: "Campaign", year: "2025", services: ["Campaign", "Art Direction"], about: "Placeholder: reuses the Tendr image until a new project is shot." },
];

// Four staggered columns, two tiles each; heights alternate so rows never line up.
const columns = [[0, 4], [1, 5], [2, 6], [3, 7]];
const mostViewed = new Set([5, 6, 7]);

// Staggered masonry: 4 offset columns, caption bottom-left, services on hover.
export default function WorkCarousel() {
  return <section className="story-work" aria-label="Selected work">
    <div className="work-masonry">
      {columns.map((col, c) => <ol key={c} className="work-col">
        {col.map(i => { const project = work[i]; return <li key={project.name} className="work-tile">
          <img src={`/hero-images/${project.image}.webp`} alt="" loading="lazy" draggable={false} />
          {mostViewed.has(i) && <span className="work-badge">Most viewed</span>}
          <div className="work-pills">
            {project.services.map(service => <span key={service} className="work-pill">{service}</span>)}
          </div>
          <p className="work-caption"><AsciiReveal as="strong" className="work-name">{project.name}</AsciiReveal> · {project.about}</p>
        </li>; })}
      </ol>)}
    </div>
  </section>;
}
