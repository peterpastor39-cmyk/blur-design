"use client";

import Link from "next/link";
import AsciiReveal from "./AsciiReveal";
import NoiseImage from "./NoiseImage";

// `href` points at a case study; work without one yet stays unlinked.
const work: { image: string; name: string; href?: string; type: string; services: string[]; about: string }[] = [
  { image: "sonar-dashboard", name: "Sonar", href: "/work/sonar", type: "Product, identity, mobile", services: ["Product Design", "Brand Identity Design", "Mobile App"], about: "A trading platform where dense on-chain data reads as calm, clear decisions." },
  { image: "billboard", name: "Billboard", type: "Identity", services: ["Brand Identity Design", "Campaign"], about: "An outdoor identity system made to be read at speed, at any distance." },
  { image: "knox-locker", name: "Knox Locker", type: "Logo", services: ["Brand Identity Design", "Logo"], about: "A mark for a smart-locker company, sketched by hand before it was drawn on screen." },
  { image: "tendr", name: "Tendr", href: "/work/tendr", type: "Packaging", services: ["Packaging", "Brand Identity Design"], about: "Skincare packaging shaped by raw stone and warm light." },
  { image: "business-cards", name: "Sonar identity", href: "/work/sonar", type: "Print", services: ["Brand Identity Design", "Print"], about: "Stationery and print that carry Sonar's mark from screen into the physical world." },
  { image: "sonar-mark", name: "Sonar mark", href: "/work/sonar", type: "Logo", services: ["Logo", "Brand Identity Design"], about: "A single glyph that has to hold up from favicon to billboard." },
];

// Numbered index grid: full-colour tiles; hover scatters the image into static, services fade in.
export default function WorkCarousel() {
  return <section className="story-work" id="work" aria-label="Selected work">
    <ol className="work-grid">
      {work.map((project, i) => <li key={project.name} className="work-tile">
        {/* Tiles in the same row resolve one after the other. */}
        <NoiseImage src={`/hero-images/${project.image}.webp`} delay={(i % 2) * 450} />
        <span className="work-index">{String(i + 1).padStart(2, "0")}</span>
        <div className="work-pills">
          {project.services.map(service => <span key={service} className="work-pill">{service}</span>)}
        </div>
        <div className="work-info">
          <AsciiReveal as="h3" className="work-name">{project.name}</AsciiReveal>
          <span className="work-pill work-type">{project.type}</span>
          <p className="work-about">{project.about}</p>
        </div>
        {project.href && <Link href={project.href} className="work-link" aria-label={`${project.name} case study`} />}
      </li>)}
    </ol>
  </section>;
}
