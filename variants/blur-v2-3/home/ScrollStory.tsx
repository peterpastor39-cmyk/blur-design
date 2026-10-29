"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WorkCarousel from "./WorkCarousel";
import AsciiReveal from "./AsciiReveal";

// Hard-cut slideshow, Porto Rocha style.
const reel = ["workshop", "device-glow", "graphic-wall", "portrait-laugh"];
// Vertical focus (0 = top, 1 = bottom) keeps faces in frame while the wide crop opens up.
const focus: Record<string, number> = { workshop: .05, "graphic-wall": .2, "device-glow": .35, "portrait-laugh": .3 };
const CUT_MS = 850;


const clamp = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
gsap.registerPlugin(ScrollTrigger);

export default function ScrollStory() {
  const track = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [copyShown, setCopyShown] = useState(false);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let id = 0, visible = false;
    const sync = () => {
      window.clearInterval(id);
      if (visible && !document.hidden && !reduced.matches) id = window.setInterval(() => {
        // Hold the same image through the move so a slideshow cut cannot break its continuity.
        if (media.current?.dataset.scrubbing !== "true") setSlide(s => (s + 1) % reel.length);
      }, CUT_MS);
    };
    const viewport = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    if (track.current) viewport.observe(track.current);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { window.clearInterval(id); viewport.disconnect(); reduced.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => {
    const section = track.current, frame = media.current;
    if (!section || !frame) return;
    const stage = section.querySelector<HTMLElement>(".story-stage")!;
    const slogan = section.querySelector<HTMLElement>(".story-slogan")!;
    const copy = section.querySelector<HTMLElement>(".story-copy")!;
    const images = Array.from(frame.querySelectorAll("img"));
    // Phones get the static stacked layout too: the scrubbed resize stutters while touch-scrolling.
    const still = matchMedia("(prefers-reduced-motion: reduce), (max-width: 800px)");
    let raf = 0, scrollRaf = 0, lastDark = -1;
    let storyTween: gsap.core.Tween | null = null;
    const playback = { progress: 0 };
    let needsMeasure = true, copyVisible = false, disposed = false, lastProgress = -1;
    let sectionTop = 0, travel = 1, baseHeight = 1;
    let start = { x: 0, y: 0, w: 1, h: 1 }, end = { ...start };
    let planes: { image: HTMLImageElement; height: number; focus: number }[] = [];

    function measure() {
      const w = stage.clientWidth, h = stage.clientHeight;
      const gutter = Math.max(18, w * .0333);
      const narrow = w < 800;
      const top0 = slogan.offsetTop + slogan.offsetHeight + (narrow ? 24 : 40);
      sectionTop = section!.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, section!.offsetHeight - h);
      start = { x: gutter, y: top0, w: w - gutter * 2, h: Math.max(220, h - top0 - gutter) };
      // On phones the image settles above the copy, which sits at the bottom of the stage.
      const endTop = h * .12;
      end = narrow
        ? { x: gutter, y: endTop, w: w - gutter * 2, h: Math.max(160, copy.offsetTop - 24 - endTop) }
        : (() => { const cw = Math.min(w * .52, 1000), ch = cw * 10 / 16; return { x: w - gutter - cw, y: (h - ch) / 2, w: cw, h: ch }; })();
      baseHeight = Math.max(start.h, end.h);
      // Keep the clipping surface and image planes fixed between resizes.
      frame!.style.width = `${start.w}px`;
      frame!.style.height = `${baseHeight}px`;
      planes = images.map(image => ({ image, height: start.w * (image.naturalHeight / image.naturalWidth || 10 / 16), focus: Number(image.dataset.focus ?? .5) }));
      lastProgress = -1;
      lastDark = -1;
      needsMeasure = false;
    }

    function render(p: number) {
      if (p === lastProgress) return;
      lastProgress = p;
      // One timed linear interpolation, like Smart Animate, independent of wheel increments.
      const s = p;
      const width = mix(start.w, end.w, s), height = mix(start.h, end.h, s);
      frame!.style.transform = `translate3d(${mix(start.x, end.x, s).toFixed(2)}px, ${mix(start.y, end.y, s).toFixed(2)}px, 0)`;
      frame!.style.clipPath = `inset(0 ${(start.w - width).toFixed(2)}px ${(baseHeight - height).toFixed(2)}px 0)`;
      for (const plane of planes) {
        const scale = Math.max(width / start.w, height / plane.height);
        plane.image.style.transform = `translate3d(${((width - start.w * scale) / 2).toFixed(2)}px, ${((height - plane.height * scale) * plane.focus).toFixed(2)}px, 0) scale(${scale.toFixed(5)})`;
      }
      section!.style.setProperty("--slogan-out", range(p, 0, .35).toFixed(4));
      const copyIn = range(p, .6, 1);
      section!.style.setProperty("--copy-in", copyIn.toFixed(4));
      if (copyVisible !== (copyIn > .3)) {
        copyVisible = copyIn > .3;
        setCopyShown(copyVisible);
      }
    }

    function updateBackground() {
      // The background still follows the short exit into the work grid.
      const p = clamp((window.scrollY - sectionTop) / travel);
      const dark = range(p, .76, .98);
      if (dark === lastDark) return;
      lastDark = dark;
      section!.style.setProperty("--dark", dark.toFixed(4));
    }

    function onScroll() {
      if (!disposed && !still.matches && !scrollRaf) scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        updateBackground();
      });
    }

    function update() {
      cancelAnimationFrame(raf);
      raf = 0;
      if (needsMeasure) measure();
      storyTween?.scrollTrigger?.refresh();
      render(playback.progress);
      updateBackground();
    }
    const schedule = () => { if (!disposed && !still.matches && !raf) raf = requestAnimationFrame(update); };
    const resize = () => { needsMeasure = true; schedule(); };
    const syncMotion = () => {
      cancelAnimationFrame(raf); raf = 0;
      cancelAnimationFrame(scrollRaf); scrollRaf = 0;
      storyTween?.scrollTrigger?.kill();
      storyTween?.kill();
      storyTween = null;
      delete frame.dataset.scrubbing;
      if (still.matches) {
        frame.removeAttribute("style");
        images.forEach(image => image.style.removeProperty("transform"));
        setCopyShown(true);
      } else {
        measure();
        const progress = window.scrollY >= sectionTop + 12 ? 1 : 0;
        storyTween = gsap.fromTo(playback, { progress: 0 }, {
          progress: 1,
          duration: .7,
          ease: "none",
          onUpdate: () => {
            frame.dataset.scrubbing = "true";
            render(playback.progress);
          },
          onComplete: () => { delete frame.dataset.scrubbing; },
          onReverseComplete: () => { delete frame.dataset.scrubbing; },
          scrollTrigger: {
            trigger: section,
            // A small scroll starts the entire move; scrolling back above it reverses it.
            start: "top -12px",
            end: "bottom top",
            toggleActions: "play none none reverse",
          },
        });
        storyTween.progress(progress).pause();
        render(progress);
        updateBackground();
        // The static layout may have left copy visible without changing progress.
        copyVisible = range(progress, .6, 1) > .3;
        setCopyShown(copyVisible);
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    observer.observe(slogan);
    observer.observe(copy);
    // Also refresh the document position if the hero changes height after fonts load.
    const hero = section.parentElement?.previousElementSibling;
    if (hero) observer.observe(hero);
    images.forEach(image => image.addEventListener("load", resize));
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", resize);
    still.addEventListener("change", syncMotion);
    syncMotion();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      storyTween?.scrollTrigger?.kill();
      storyTween?.kill();
      delete frame.dataset.scrubbing;
      observer.disconnect();
      images.forEach(image => image.removeEventListener("load", resize));
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", resize);
      still.removeEventListener("change", syncMotion);
    };
  }, []);

  return <div className="story">
    <section className="story-track" ref={track} aria-label="About Blur">
      <div className="story-stage">
        <AsciiReveal as="h2" className="story-slogan">An independent studio turning hard questions into <em>clear brands and products.</em></AsciiReveal>
        <div className="story-copy">
          <AsciiReveal as="h3" active={copyShown}>We work with growing teams, helping them shape ideas into brands and products that are clear, considered, and built to last.</AsciiReveal>
        </div>
        <div className="story-media" ref={media}>
          {reel.map((image, i) => <img key={image} src={`/hero-images/${image}.webp`} alt="" aria-hidden={i !== slide} data-on={i === slide} data-focus={focus[image]} loading="lazy" decoding="async" draggable={false} />)}
        </div>
      </div>
    </section>
    <WorkCarousel />
  </div>;
}
