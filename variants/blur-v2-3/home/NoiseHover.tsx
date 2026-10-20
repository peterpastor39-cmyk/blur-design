"use client";

import { useEffect, useId, useRef } from "react";

// Same "lost signal" hover as NoiseImage, shared across many elements: one SVG filter,
// applied to whichever matching element the pointer enters, then removed once it settles.
const PEAK = 46, DURATION = 700;

export default function NoiseHover({ selector }: { selector: string }) {
  const id = useId().replace(/:/g, "");
  const turbulence = useRef<SVGFETurbulenceElement>(null);
  const displace = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    const noise = turbulence.current, map = displace.current;
    if (!noise || !map) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, start = 0, lastScroll = -Infinity, current: HTMLElement | null = null;

    function release() { if (current) current.style.filter = ""; current = null; }
    function draw(now: number) {
      const t = Math.min(1, (now - start) / DURATION);
      map!.setAttribute("scale", (PEAK * (1 - t) ** 2.2).toFixed(2));
      noise!.setAttribute("seed", String(Math.floor(Math.random() * 1000)));
      if (t < 1) frame = requestAnimationFrame(draw);
      else { frame = 0; release(); }
    }
    function over(event: PointerEvent) {
      if (reduced.matches || event.pointerType === "touch") return;
      if (performance.now() - lastScroll < 180) return;
      const host = (event.target as Element).closest?.<HTMLElement>(selector);
      if (!host || host.contains(event.relatedTarget as Node)) return;
      // A moving reel can cross a stationary pointer. Keep its expensive noise filter
      // out of the scroll animation, while preserving the hover once scrolling settles.
      if (host.matches(".story-media") && host.dataset.scrubbing === "true") return;
      // The story reel swaps images while you hover, so filter its frame rather than one image.
      const target = host.matches(".story-media") ? host : host.querySelector<HTMLElement>("img") ?? host;
      cancelAnimationFrame(frame); release();
      current = target; current.style.filter = `url(#${id})`;
      start = performance.now(); frame = requestAnimationFrame(draw);
    }
    function scroll() {
      lastScroll = performance.now();
      if (current) { cancelAnimationFrame(frame); frame = 0; release(); }
    }
    document.addEventListener("pointerover", over);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { cancelAnimationFrame(frame); release(); document.removeEventListener("pointerover", over); window.removeEventListener("scroll", scroll); };
  }, [id, selector]);

  return <svg className="noise-defs" aria-hidden="true" focusable="false">
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feTurbulence ref={turbulence} type="fractalNoise" baseFrequency="0.7 0.8" numOctaves="1" seed="0" result="static" />
      <feDisplacementMap ref={displace} in="SourceGraphic" in2="static" scale="0" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>;
}
