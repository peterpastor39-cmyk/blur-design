"use client";
import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; r: number; phase: number; speed: number; peak: number };

// Randomised twinkling specks, denser in the dark-to-blue band, to read as signal distortion.
export default function Sparkles({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dots: Dot[] = [];
    let frame = 0;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((width * height) / 5500);
      dots = Array.from({ length: count }, () => {
        // bias vertical position toward 35–75% where the horizon glows
        const y = (0.35 + (Math.random() + Math.random()) / 2 * 0.45) * height;
        return { x: Math.random() * width, y, r: Math.random() < 0.08 ? 1.4 + Math.random() : 0.4 + Math.random() * 0.7, phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 1.6, peak: 0.45 + Math.random() * 0.55 };
      });
    };

    const draw = (t: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        const a = still ? d.peak * 0.6 : d.peak * Math.max(0, Math.sin(t / 1000 * d.speed + d.phase)) ** 3;
        if (a < 0.02) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#eaf6ff";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        if (d.r > 1.3) { ctx.globalAlpha = a * 0.35; ctx.fillRect(d.x - d.r * 3, d.y - 0.25, d.r * 6, 0.5); ctx.fillRect(d.x - 0.25, d.y - d.r * 3, 0.5, d.r * 6); }
      }
      if (!still) frame = requestAnimationFrame(draw);
    };

    seed();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", seed);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", seed); };
  }, []);

  return <canvas ref={ref} className={className} />;
}
