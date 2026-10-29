"use client";
import { useEffect, useRef, useState } from "react";
import type { Figure } from "@/content/work";
import { imageSize } from "@/content/work";

// A few images in one frame, crossfading every few seconds while on screen (held on the first for reduced motion).
const HOLD = 1800;

export default function Slides({ slug, figs, sizes, ratio = "3 / 2" }: { slug: string; figs: Figure[]; sizes: string; ratio?: string }) {
  const [i, setI] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !box.current) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setI(n => (n + 1) % figs.length), HOLD);
    });
    io.observe(box.current);
    return () => { io.disconnect(); clearInterval(timer); };
  }, [figs.length]);

  return <div ref={box} className="cs-media cs-slides" style={{ aspectRatio: ratio }}>
    {figs.map((f, n) => {
      const [w, h] = imageSize(slug, f.name), base = `/work/${slug}/${f.name}`;
      const srcSet = [`${base}-1000.avif ${Math.min(1000, w)}w`, ...(w > 1000 ? [`${base}-2000.avif ${Math.min(2000, w)}w`] : [])].join(", ");
      return <picture key={f.name} className={n === i ? "is-on" : undefined}>
        <source type="image/avif" srcSet={srcSet} sizes={sizes} />
        <img src={`${base}.webp`} alt={f.alt} width={w} height={h} loading="lazy" decoding="async" draggable={false} />
      </picture>;
    })}
  </div>;
}
