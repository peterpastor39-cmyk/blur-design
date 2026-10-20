"use client";

import { useEffect, useId, useRef } from "react";

// Hover "lost signal" effect (after Hyperplexed's turbulent hover): fractal noise drives a
// displacement map. On hover the image scatters into static and settles back while it zooms in.
const PEAK = 46, DURATION = 700;

export default function NoiseImage({ src, alt = "" }: { src: string; alt?: string }) {
  const id = useId().replace(/:/g, "");
  const img = useRef<HTMLImageElement>(null);
  const turbulence = useRef<SVGFETurbulenceElement>(null);
  const displace = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    const image = img.current, noise = turbulence.current, map = displace.current;
    const tile = image?.closest<HTMLElement>(".work-tile");
    if (!image || !noise || !map || !tile) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, start = 0, lastScroll = -Infinity;

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
      if (reduced.matches || performance.now() - lastScroll < 180) return;
      cancelAnimationFrame(frame);
      image!.style.filter = `url(#${id})`;
      start = performance.now();
      frame = requestAnimationFrame(draw);
    }
    function scroll() {
      lastScroll = performance.now();
      if (frame) { cancelAnimationFrame(frame); frame = 0; image!.style.filter = ""; }
    }
    tile.addEventListener("pointerenter", enter);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { cancelAnimationFrame(frame); tile.removeEventListener("pointerenter", enter); window.removeEventListener("scroll", scroll); };
  }, [id]);

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
