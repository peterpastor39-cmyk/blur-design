"use client";

import { useEffect, useRef, useState } from "react";
import WorkCarousel from "./WorkCarousel";
import AsciiReveal from "./AsciiReveal";

// Hard-cut slideshow, Porto Rocha style.
const reel = ["tendr", "billboard", "sonar-dashboard", "knox-locker", "business-cards", "sonar-mobile", "sonar-mark"];
const CUT_MS = 850;


const clamp = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => 1 - (1 - t) ** 3;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export default function ScrollStory() {
  const track = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [copyShown, setCopyShown] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setSlide(s => (s + 1) % reel.length), CUT_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const section = track.current, frame = media.current;
    if (!section || !frame) return;
    const stage = section.querySelector<HTMLElement>(".story-stage")!;
    const slogan = section.querySelector<HTMLElement>(".story-slogan")!;
    let raf = 0;

    function update() {
      raf = 0;
      const box = section!.getBoundingClientRect();
      const travel = box.height - innerHeight;
      const p = travel > 0 ? clamp(-box.top / travel) : 1;
      const w = stage.clientWidth, h = stage.clientHeight;
      const gutter = Math.max(18, w * .0333);
      const narrow = w < 800;
      const top0 = slogan.offsetTop + slogan.offsetHeight + (narrow ? 24 : 40);
      const start = { x: gutter, y: top0, w: w - gutter * 2, h: Math.max(220, h - top0 - gutter) };
      const end = narrow
        ? { x: gutter, y: h * .46, w: w - gutter * 2, h: h * .46 - gutter }
        : (() => { const cw = Math.min(w * .52, 1000), ch = cw * 10 / 16; return { x: w - gutter - cw, y: (h - ch) / 2, w: cw, h: ch }; })();
      const s = ease(range(p, .08, .6));
      frame!.style.transform = `translate3d(${mix(start.x, end.x, s).toFixed(2)}px, ${mix(start.y, end.y, s).toFixed(2)}px, 0)`;
      frame!.style.width = `${mix(start.w, end.w, s).toFixed(2)}px`;
      frame!.style.height = `${mix(start.h, end.h, s).toFixed(2)}px`;
      section!.style.setProperty("--slogan-out", range(p, .05, .35).toFixed(4));
      const copyIn = ease(range(p, .5, .7));
      section!.style.setProperty("--copy-in", copyIn.toFixed(4));
      setCopyShown(copyIn > .3);
      section!.style.setProperty("--dark", range(p, .78, 1).toFixed(4));
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", schedule); removeEventListener("resize", schedule); };
  }, []);

  return <div className="story">
    <section className="story-track" ref={track} aria-label="About Blur">
      <div className="story-stage">
        <AsciiReveal as="h2" className="story-slogan">We’re create partners to torch-bearing brands buildings <em>product for tomorrow</em></AsciiReveal>
        <div className="story-copy">
          <p className="story-label">( The step aside )</p>
          <AsciiReveal as="h3" active={copyShown}>Strategy first. Craft always. Nothing ordinary.</AsciiReveal>
          <p className="story-body">Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra.</p>
        </div>
        <div className="story-media" ref={media}>
          {reel.map((image, i) => <img key={image} src={`/hero-images/${image}.webp`} alt="" aria-hidden={i !== slide} data-on={i === slide} draggable={false} />)}
        </div>
      </div>
    </section>
    <WorkCarousel />
  </div>;
}
