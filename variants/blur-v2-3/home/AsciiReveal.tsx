"use client";

import { useEffect, useRef, type ElementType, type FC, type ReactNode } from "react";

// Same glyph language as the hero headline: a title arrives as flickering characters,
// then the characters drop out one by one while the real type sharpens underneath.
const GLYPHS = ".:+*#R3@";
const DURATION = 650;
const PAD = 24;

type Point = { ox: number; oy: number; dx: number; dy: number; seed: number; fade: number; color: string };

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const range = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (t: number) => 1 - (1 - t) ** 3;

function fontOf(style: CSSStyleDeclaration) {
  return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

export default function AsciiReveal({ as: Tag = "h2", className = "", active, children, ...rest }: {
  as?: ElementType; className?: string; active?: boolean; children: ReactNode; id?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const control = useRef<{ play: () => void; reset: () => void } | null>(null);

  useEffect(() => {
    const host = root.current, surface = canvas.current;
    const ctx = surface?.getContext("2d");
    if (!host || !surface || !ctx) return;
    const text = host.querySelector<HTMLElement>(".ascii-text")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let points: Point[] = [], atlases = new Map<string, HTMLCanvasElement>();
    let width = 0, height = 0, cell = 4, glyphSize = 6, start = 0, frame = 0, state: "idle" | "playing" | "done" = "idle";

    function show(alpha: number) {
      text.style.opacity = alpha.toFixed(3);
      text.style.filter = alpha >= 1 ? "" : `blur(${((1 - alpha) * 8).toFixed(2)}px)`;
    }

    function atlas(color: string) {
      let sheet = atlases.get(color);
      if (sheet) return sheet;
      const tile = 32;
      sheet = document.createElement("canvas");
      sheet.width = tile * GLYPHS.length; sheet.height = tile;
      const g = sheet.getContext("2d")!;
      g.fillStyle = color; g.font = '600 22px "Courier New", monospace';
      g.textAlign = "center"; g.textBaseline = "middle";
      for (let i = 0; i < GLYPHS.length; i++) g.fillText(GLYPHS[i], i * tile + tile / 2, tile / 2);
      atlases.set(color, sheet);
      return sheet;
    }

    // Lay the real words out exactly where the browser put them, then sample them into a grid.
    function build() {
      const box = host!.getBoundingClientRect();
      width = box.width + PAD * 2; height = box.height + PAD * 2;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      surface!.width = Math.round(width * dpr); surface!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = parseFloat(getComputedStyle(host!).fontSize) || 40;
      cell = Math.min(6, Math.max(2.6, size * .075));
      const cellY = cell * 1.3;
      glyphSize = cell * 1.65;

      const groups = new Map<string, { word: string; x: number; y: number; font: string; spacing: string }[]>();
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const style = getComputedStyle(node.parentElement!);
        const upper = style.textTransform === "uppercase";
        for (const match of node.textContent!.matchAll(/\S+/g)) {
          range.setStart(node, match.index!); range.setEnd(node, match.index! + match[0].length);
          const rect = range.getClientRects()[0];
          if (!rect) continue;
          const list = groups.get(style.color) ?? [];
          list.push({ word: upper ? match[0].toUpperCase() : match[0], x: rect.left - box.left + PAD, y: rect.top - box.top + PAD, font: fontOf(style), spacing: style.letterSpacing });
          groups.set(style.color, list);
        }
      }

      const mask = document.createElement("canvas");
      mask.width = Math.ceil(width / cell); mask.height = Math.ceil(height / cellY);
      const m = mask.getContext("2d", { willReadFrequently: true })!;
      points = [];
      for (const [color, words] of groups) {
        m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, mask.width, mask.height);
        m.setTransform(1 / cell, 0, 0, 1 / cellY, 0, 0);
        m.fillStyle = "#000"; m.textBaseline = "alphabetic";
        for (const w of words) {
          m.font = w.font;
          (m as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = w.spacing === "normal" ? "0px" : w.spacing;
          const metrics = m.measureText(w.word);
          m.fillText(w.word, w.x, w.y + metrics.fontBoundingBoxAscent);
        }
        const pixels = m.getImageData(0, 0, mask.width, mask.height).data;
        for (let y = 0; y < mask.height; y++) for (let x = 0; x < mask.width; x++) {
          if (pixels[(y * mask.width + x) * 4 + 3] > 60) {
            const seed = (x * 17 + y * 31) % 101;
            const angle = Math.random() * Math.PI * 2, reach = (2 + Math.random() * 6) * cell;
            points.push({ ox: (x + .5) * cell, oy: (y + .5) * cellY, dx: Math.cos(angle) * reach, dy: Math.sin(angle) * reach, seed, fade: .3 + Math.random() * .5, color });
          }
        }
      }
    }

    function draw(now: number) {
      frame = 0;
      const t = clamp((now - start) / DURATION);
      ctx!.clearRect(0, 0, width, height);
      const gather = 1 - ease(range(t, 0, .35));
      const step = Math.floor(now / 55);
      for (const p of points) {
        const alpha = 1 - range(t, p.fade, p.fade + .12);
        if (alpha <= 0) continue;
        let random = (Math.imul(p.seed + 1, 374761393) ^ Math.imul(step + p.seed + 1, 668265263)) >>> 0;
        random = Math.imul(random ^ (random >>> 13), 1274126177) >>> 0;
        const index = ((random ^ (random >>> 16)) >>> 0) % GLYPHS.length;
        ctx!.globalAlpha = alpha * (.76 + (p.seed % 4) * .075);
        ctx!.drawImage(atlas(p.color), index * 32, 0, 32, 32, p.ox + p.dx * gather - glyphSize / 2, p.oy + p.dy * gather - glyphSize / 2, glyphSize, glyphSize);
      }
      ctx!.globalAlpha = 1;
      show(ease(range(t, .3, .85)));
      if (t < 1) frame = requestAnimationFrame(draw);
      else { ctx!.clearRect(0, 0, width, height); state = "done"; show(1); }
    }

    function play() {
      if (state !== "idle") return;
      if (reduced.matches) { state = "done"; show(1); return; }
      build(); state = "playing"; start = performance.now();
      frame = requestAnimationFrame(draw);
    }
    function reset() {
      if (reduced.matches) return;
      cancelAnimationFrame(frame); frame = 0; state = "idle";
      ctx!.clearRect(0, 0, width, height); show(0);
    }
    control.current = { play, reset };

    if (!reduced.matches) show(0);
    let observer: IntersectionObserver | undefined;
    if (active === undefined) {
      // Plays each time the title comes into view; re-arms once it has fully left.
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= .6) play();
          else if (!entry.isIntersecting) reset();
        }
      }, { threshold: [0, .6] });
      observer.observe(host);
    }
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); control.current = null; show(1); };
  }, [active === undefined]);

  useEffect(() => {
    if (active === undefined) return;
    if (active) control.current?.play(); else control.current?.reset();
  }, [active]);

  const El = Tag as unknown as FC<any>;
  return <El ref={root} className={`ascii-reveal ${className}`} {...rest}>
    <span className="ascii-text">{children}</span>
    <canvas ref={canvas} className="ascii-canvas" aria-hidden="true" />
  </El>;
}
