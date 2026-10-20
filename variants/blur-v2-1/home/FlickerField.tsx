"use client";

import { useEffect, useRef } from "react";

// Sparse dots scattered over the empty white space, each blinking on its own random rhythm.
const DENSITY = 1 / 2600; // dots per px²

export default function FlickerField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const surface = canvas.current;
    const ctx = surface?.getContext("2d");
    if (!surface || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    type Dot = { x: number; y: number; size: number; on: number; next: number; peak: number };
    let dots: Dot[] = [], width = 0, height = 0, frame = 0;

    function spawn(now: number): Dot {
      return {
        x: Math.random() * width, y: Math.random() * height,
        size: Math.random() < .85 ? 1.4 : 2.6,
        on: 0, peak: .25 + Math.random() * .6,
        next: now + Math.random() * 2400,
      };
    }
    function build() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = surface!.clientWidth; height = surface!.clientHeight;
      surface!.width = Math.round(width * dpr); surface!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const now = performance.now();
      dots = Array.from({ length: Math.round(width * height * DENSITY) }, () => spawn(now));
      if (reduced.matches) draw(now);
    }
    function draw(now: number) {
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];
        if (now >= dot.next) {
          if (dot.on > 0) dot = dots[i] = { ...spawn(now), next: now + 200 + Math.random() * 2600 };
          else { dot.on = dot.peak; dot.next = now + 60 + Math.random() * (Math.random() < .2 ? 900 : 220); }
        }
        // Occasional stutter while lit, like a failing bulb.
        const alpha = reduced.matches ? dot.peak * .5 : dot.on * (Math.random() < .08 ? .2 : 1);
        if (alpha <= 0) continue;
        ctx!.fillStyle = `rgba(17,17,17,${alpha.toFixed(3)})`;
        ctx!.fillRect(dot.x, dot.y, dot.size, dot.size);
      }
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    }
    const resize = new ResizeObserver(build);
    resize.observe(surface);
    build();
    if (!reduced.matches) frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, []);
  return <canvas ref={canvas} className="flicker-field" aria-hidden="true" />;
}
