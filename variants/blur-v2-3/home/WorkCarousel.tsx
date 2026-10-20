"use client";

import AsciiReveal from "./AsciiReveal";
import NoiseImage from "./NoiseImage";

const work = [
  { image: "sonar-dashboard", name: "Sonar", type: "Product, identity, mobile", services: ["Product Design", "Brand Identity Design", "Mobile App"], about: "A trading platform where dense on-chain data reads as calm, clear decisions." },
  { image: "billboard", name: "Billboard", type: "Identity", services: ["Brand Identity Design", "Campaign"], about: "An outdoor identity system made to be read at speed, at any distance." },
  { image: "knox-locker", name: "Knox Locker", type: "Logo", services: ["Brand Identity Design", "Logo"], about: "A mark for a smart-locker company, sketched by hand before it was drawn on screen." },
  { image: "tendr", name: "Tendr", type: "Packaging", services: ["Packaging", "Brand Identity Design"], about: "Skincare packaging shaped by raw stone and warm light." },
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
