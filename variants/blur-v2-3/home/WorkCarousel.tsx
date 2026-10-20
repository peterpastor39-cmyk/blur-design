"use client";

import AsciiReveal from "./AsciiReveal";
import NoiseImage from "./NoiseImage";

const work = [
  { image: "billboard", name: "Billboard", type: "Branding", year: "2026", services: ["Brand Identity Design", "Campaign"], about: "An outdoor identity system built to be read at speed, in any city, at any distance." },
  { image: "sonar-dashboard", name: "Sonar", type: "Website", year: "2026", services: ["Product Design", "Design System"], about: "A trading dashboard that turns dense on-chain data into calm, confident decisions." },
  { image: "knox-locker", name: "Knox Locker", type: "Branding", year: "2025", services: ["Brand Identity Design", "Logo"], about: "A mark for a smart-locker company, sketched by hand before it was ever drawn on screen." },
  { image: "tendr", name: "Tendr", type: "Packaging", year: "2025", services: ["Packaging", "Brand Identity Design"], about: "Skincare packaging grounded in raw stone and warm light, quiet on the shelf and loud in the hand." },
  { image: "business-cards", name: "Sonar identity", type: "Branding", year: "2025", services: ["Brand Identity Design", "Print"], about: "Stationery and print that carry Sonar's mark from screen into the physical world." },
  { image: "sonar-mobile", name: "Sonar mobile", type: "Mobile App", year: "2026", services: ["Product Design", "Mobile App"], about: "Sonar's trading tools, rebuilt for the thumb without losing the depth." },
];

// Numbered index grid: full-colour tiles; hover scatters the image into static, services fade in.
export default function WorkCarousel() {
  return <section className="story-work" aria-label="Selected work">
    <ol className="work-grid">
      {work.map((project, i) => <li key={project.name} className="work-tile">
        <NoiseImage src={`/hero-images/${project.image}.webp`} />
        <span className="work-index">{String(i + 1).padStart(2, "0")}</span>
        <div className="work-pills">
          {project.services.map(service => <span key={service} className="work-pill">{service}</span>)}
        </div>
        <div className="work-info">
          <AsciiReveal as="h3" className="work-name">{project.name}</AsciiReveal>
          <span className="work-pill work-type">{project.type}</span>
          <p className="work-about">{project.about}</p>
        </div>
      </li>)}
    </ol>
  </section>;
}
