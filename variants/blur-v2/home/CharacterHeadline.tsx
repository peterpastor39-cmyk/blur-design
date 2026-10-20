"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number; ox: number; oy: number; vx: number; vy: number; seed: number };
const GLYPHS = ".:+*#R3@";

export default function CharacterHeadline({ enabled, paused }: { enabled: boolean; paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = host.current;
    const surface = canvas.current;
    if (!container || !surface || !enabled) return;
    const ctx = surface.getContext("2d", { alpha: true });
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    let points: Point[] = [];
    let width = 0, height = 0, fontSize = 8, frame = 0, previous = 0;
    let disposed = false, visible = !document.hidden, pointerActive = false;
    const pointer = { x: -1000, y: -1000 };
    let pulse: { x: number; y: number; time: number } | null = null;
    let atlas: HTMLCanvasElement;
    let tile = 20;

    function draw(now: number) {
      frame = 0;
      if (disposed || !visible || !ctx) return;
      const dt = Math.min((now - (previous || now - 16.67)) / 16.67, 2);
      previous = now;
      const animate = !paused && !reduce.matches;
      const radius = width < 600 ? 70 : 125;
      let maxDisplacement = 0;
      ctx.clearRect(0, 0, width, height);
      for (const p of points) {
        const dx = p.ox - pointer.x, dy = p.oy - pointer.y;
        const distance = Math.hypot(dx, dy);
        const strength = animate && pointerActive ? Math.max(0, 1 - distance / radius) ** 2 : 0;
        let tx = p.ox, ty = p.oy;
        if (strength > 0) {
          const lens = strength * 54;
          tx += dx / Math.max(distance, 1) * lens;
          ty += dy / Math.max(distance, 1) * lens + Math.sin(now / 220 + p.ox / 35) * strength * 7;
        }
        if (animate && pulse) {
          const age = (now - pulse.time) / 1000;
          const px = p.ox - pulse.x, py = p.oy - pulse.y;
          const pd = Math.hypot(px, py);
          const wave = Math.exp(-(((pd - age * 280) / 45) ** 2)) * Math.max(0, 1 - age / 1.5) * 32;
          tx += px / Math.max(pd, 1) * wave;
          ty += py / Math.max(pd, 1) * wave;
        }
        if (animate) {
          p.vx = (p.vx + (tx - p.x) * .11 * dt) * .73 ** dt;
          p.vy = (p.vy + (ty - p.y) * .11 * dt) * .73 ** dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        } else { p.x = p.ox; p.y = p.oy; p.vx = p.vy = 0; }
        const displacement = Math.hypot(p.x - p.ox, p.y - p.oy);
        maxDisplacement = Math.max(maxDisplacement, displacement);
        // Each point changes on its own staggered clock, even without a pointer.
        const flickerStep = animate ? Math.floor(now / 110 + p.seed * .31) : 0;
        let random = (Math.imul(p.seed + 1, 374761393) ^ Math.imul(flickerStep + 1, 668265263)) >>> 0;
        random = Math.imul(random ^ (random >>> 13), 1274126177) >>> 0;
        const index = ((random ^ (random >>> 16)) >>> 0) % GLYPHS.length;
        ctx.globalAlpha = .76 + (p.seed % 4) * .075;
        ctx.drawImage(atlas, index * tile, 0, tile, tile, p.x - fontSize * .5, p.y - fontSize * .6, fontSize * 1.4, fontSize * 1.4);
      }
      ctx.globalAlpha = 1;
      surface!.dataset.displacement = maxDisplacement.toFixed(2);
      if (pulse && now - pulse.time > 1600) pulse = null;
      if (animate) frame = requestAnimationFrame(draw);
    }

    function wake() { if (!frame && visible && points.length) frame = requestAnimationFrame(draw); }

    function build() {
      if (!image.complete || !image.naturalWidth || !container || !surface || !ctx || disposed) return;
      const box = container.getBoundingClientRect();
      const titleBox = container.querySelector("h1")!.getBoundingClientRect();
      width = box.width; height = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      surface.width = Math.round(width * dpr); surface.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cellX = width < 600 ? 3.2 : 5.2;
      const cellY = width < 600 ? 4.4 : 6.8;
      fontSize = width < 600 ? 5.6 : 8.6;
      const mask = document.createElement("canvas");
      mask.width = Math.ceil(width / cellX); mask.height = Math.ceil(height / cellY);
      const sample = mask.getContext("2d", { willReadFrequently: true });
      if (!sample) return;
      sample.drawImage(image, (titleBox.left - box.left) / cellX, (titleBox.top - box.top) / cellY, titleBox.width / cellX, titleBox.height / cellY);
      const pixels = sample.getImageData(0, 0, mask.width, mask.height).data;
      points = [];
      for (let y = 0; y < mask.height; y++) for (let x = 0; x < mask.width; x++) {
        if (pixels[(y * mask.width + x) * 4 + 3] > 28) {
          const ox = (x + .5) * cellX, oy = (y + .5) * cellY;
          points.push({ x: ox, y: oy, ox, oy, vx: 0, vy: 0, seed: (x * 17 + y * 31) % 101 });
        }
      }
      atlas = document.createElement("canvas"); tile = 32;
      atlas.width = tile * GLYPHS.length; atlas.height = tile;
      const glyph = atlas.getContext("2d")!;
      glyph.fillStyle = "#171717";
      glyph.font = '600 22px "Courier New", monospace';
      glyph.textAlign = "center"; glyph.textBaseline = "middle";
      for (let i = 0; i < GLYPHS.length; i++) glyph.fillText(GLYPHS[i], i * tile + tile / 2, tile / 2);
      surface.dataset.pointCount = String(points.length);
      setReady(points.length > 0); previous = 0; wake();
    }

    function move(event: PointerEvent) {
      if (paused || reduce.matches || !container) return;
      const r = container.getBoundingClientRect();
      pointer.x = event.clientX - r.left; pointer.y = event.clientY - r.top;
      pointerActive = true; wake();
    }
    function leave() { pointerActive = false; wake(); }
    function release(event: PointerEvent) { if (event.pointerType !== "mouse") leave(); }
    function press(event: PointerEvent) {
      if (paused || reduce.matches || !container) return;
      const r = container.getBoundingClientRect();
      pulse = { x: event.clientX - r.left, y: event.clientY - r.top, time: performance.now() };
      wake();
    }
    function preference() { leave(); wake(); }
    function visibility() {
      visible = !document.hidden;
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
      previous = 0; if (visible) wake();
    }
    const resize = new ResizeObserver(build);
    resize.observe(container);
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerleave", leave);
    container.addEventListener("pointerdown", press);
    container.addEventListener("pointerup", release);
    reduce.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    image.onload = build;
    image.src = "/hero-headline.svg";
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect();
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      container.removeEventListener("pointerdown", press);
      container.removeEventListener("pointerup", release);
      reduce.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled, paused]);

  return (
    <div className="character-stage" ref={host} data-ready={enabled && ready} data-paused={paused}>
      <h1 className="character-title">
        <span className="study-sr-only">Every great innovation starts with a question.</span>
        {/* Original Cormorant outlines from the user's editable Figma headline. */}
        <img src="/hero-headline.svg" alt="" aria-hidden="true" width="1356" height="399" draggable="false" />
      </h1>
      {enabled && <canvas ref={canvas} className="character-canvas" aria-hidden="true" />}
    </div>
  );
}
