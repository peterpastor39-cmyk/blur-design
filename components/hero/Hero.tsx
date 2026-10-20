"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroCanvas from "./HeroCanvas";
import type { LightState } from "./lightState";

gsap.registerPlugin(useGSAP);

const LINKS = ["Work", "Socials", "Blog"];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  // Shared, mutable light state: GSAP writes it, the shader reads it every frame.
  const light = useRef<LightState>({ x: 0.5, y: 0.55, intensity: 0, speed: 1 });

  useGSAP(
    () => {
      const L = light.current;
      // TEMP debug: ?lx=0.5&ly=0.5 pins the light for headless screenshots
      const q = new URLSearchParams(location.search);
      if (q.has("lx")) {
        L.x = Number(q.get("lx"));
        L.y = Number(q.get("ly"));
        L.intensity = 1;
      }
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(pointer: fine)").matches;

      if (reduceMotion) L.speed = 0;

      // Intro: light fades up while nav and headline slide in.
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(L, { intensity: 1, duration: 2.4, ease: "power2.inOut" }, 0)
        .from("[data-nav-item]", { autoAlpha: 0, y: -14, duration: 1, stagger: 0.08 }, 0.3)
        .from("[data-line]", { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.45);

      if (!finePointer || reduceMotion) {
        // Touch / reduced motion: let the light drift slowly on its own.
        if (!reduceMotion) {
          gsap.to(L, { x: 0.68, duration: 5.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
          gsap.to(L, { y: 0.35, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
        }
        return;
      }

      // Cursor-following light, smoothed so it glides rather than snaps.
      const xTo = gsap.quickTo(L, "x", { duration: 0.9, ease: "power3" });
      const yTo = gsap.quickTo(L, "y", { duration: 0.9, ease: "power3" });

      const onMove = (e: PointerEvent) => {
        xTo(e.clientX / window.innerWidth);
        yTo(1 - e.clientY / window.innerHeight);
      };
      const onEnter = () => {
        gsap.to(L, { intensity: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" });
      };
      const onLeave = () => {
        gsap.to(L, { intensity: 0, duration: 1.6, ease: "power2.out", overwrite: "auto" });
      };

      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("mouseenter", onEnter);
      document.documentElement.addEventListener("mouseleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("mouseenter", onEnter);
        document.documentElement.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: root }
  );

  return (
    <section className="hero" ref={root}>
      <HeroCanvas light={light} />

      <nav className="nav">
        <a href="/" className="nav__logo" aria-label="Blur home" data-nav-item>
          <img src="/blur-wordmark.svg" alt="Blur" />
        </a>
        <ul className="nav__links">
          {LINKS.map((label) => (
            <li key={label} data-nav-item>
              <a href={`#${label.toLowerCase()}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <h1 className="headline">
        <span className="headline__line">
          <span data-line>Every Idea Starts</span>
        </span>
        <span className="headline__line">
          <span data-line>With Something</span>
        </span>
      </h1>
    </section>
  );
}
