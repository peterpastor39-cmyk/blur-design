"use client";

import { useEffect, useId, useRef } from "react";

// Hover "lost signal" effect (after Hyperplexed's turbulent hover): fractal noise drives a
// displacement map. On hover the image scatters into static and settles back while it zooms in.
const PEAK = 46, DURATION = 700;
// Scroll-in, as in More work: the image resolves out of blurred static as it fades up.
const IN_PEAK = 90, IN_BLUR = 24, IN_DURATION = 1500;

export default function NoiseImage({ src, alt = "", delay = 0 }: { src: string; alt?: string; delay?: number }) {
  const id = useId().replace(/:/g, "");
  const img = useRef<HTMLImageElement>(null);
  const turbulence = useRef<SVGFETurbulenceElement>(null);
  const displace = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    const image = img.current, noise = turbulence.current, map = displace.current;
    const tile = image?.closest<HTMLElement>(".work-tile");
    if (!image || !noise || !map || !tile) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, start = 0, lastScroll = -Infinity, timer = 0;
    // Hover only runs once the image has fully resolved in.
    let state: "hidden" | "appearing" | "shown" = reduced.matches ? "shown" : "hidden";

    function draw(now: number) {
      const t = Math.min(1, (now - start) / DURATION);
      const strength = (1 - t) ** 2.2;
      map!.setAttribute("scale", (PEAK * strength).toFixed(2));
      // Re-seed every frame so the static crackles instead of sitting still.
      noise!.setAttribute("seed", String(Math.floor(Math.random() * 1000)));
      if (t < 1) frame = requestAnimationFrame(draw);
      else { image!.style.filter = ""; frame = 0; }
    }
    function enter() {
      if (reduced.matches || state !== "shown" || performance.now() - lastScroll < 180) return;
      cancelAnimationFrame(frame);
      image!.style.filter = `url(#${id})`;
      start = performance.now();
      frame = requestAnimationFrame(draw);
    }
    function scroll() {
      lastScroll = performance.now();
      if (state === "shown" && frame) { cancelAnimationFrame(frame); frame = 0; image!.style.filter = ""; }
    }

    function pose(p: number) {
      const k = 1 - (1 - p) ** 3;
      map!.setAttribute("scale", String(IN_PEAK * (1 - k)));
      noise!.setAttribute("seed", String(Math.floor(p * 40)));
      image!.style.opacity = String(Math.min(1, p * 1.6));
      image!.style.filter = `url(#${id}) blur(${(IN_BLUR * (1 - k)).toFixed(2)}px)`;
    }
    function appear() {
      state = "appearing";
      const begin = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - begin) / IN_DURATION);
        pose(p);
        if (p < 1) frame = requestAnimationFrame(tick);
        else { frame = 0; state = "shown"; image!.style.filter = ""; map!.setAttribute("scale", "0"); }
      };
      frame = requestAnimationFrame(tick);
    }
    function hide() { cancelAnimationFrame(frame); frame = 0; clearTimeout(timer); state = "hidden"; pose(0); }
    // Plays each time the tile enters; re-arms once it has fully left the viewport.
    const io = new IntersectionObserver(([e]) => {
      if (reduced.matches) return;
      if (e.intersectionRatio >= .25 && state === "hidden") { state = "appearing"; timer = window.setTimeout(appear, delay); }
      else if (!e.isIntersecting) hide();
    }, { threshold: [0, .25] });
    if (state === "hidden") pose(0);
    io.observe(tile);

    tile.addEventListener("pointerenter", enter);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      io.disconnect(); clearTimeout(timer); cancelAnimationFrame(frame);
      image.style.opacity = image.style.filter = "";
      tile.removeEventListener("pointerenter", enter); window.removeEventListener("scroll", scroll);
    };
  }, [id, delay]);

  return <>
    <svg className="noise-defs" aria-hidden="true" focusable="false">
      <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence ref={turbulence} type="fractalNoise" baseFrequency="0.7 0.8" numOctaves="1" seed="0" result="static" />
        <feDisplacementMap ref={displace} in="SourceGraphic" in2="static" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
    <img ref={img} src={src} alt={alt} loading="lazy" draggable={false} />
  </>;
}
