"use client";
import { useEffect, useId, useRef } from "react";
import { imageSize } from "@/content/work";

// Case-study image: AVIF srcset with a WebP fallback, lazy by default.
// With `video`, a muted looping MP4 (WebP poster) takes the image's place; it holds its
// first frame through the reveal and starts playing once fully in (never, for reduced motion).
// On first view it resolves out of blurred static (same move as the homepage tiles), then stays put.
const PEAK = 80, BLUR = 20, DURATION = 1400;

export default function Media({ slug, name, alt, sizes, video, eager = false, className = "" }: {
  slug: string; name: string; alt: string; sizes: string; video?: [number, number]; eager?: boolean; className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const img = useRef<HTMLImageElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const noise = useRef<SVGFETurbulenceElement>(null);
  const map = useRef<SVGFEDisplacementMapElement>(null);
  const [w, h] = video ?? imageSize(slug, name);
  const base = `/work/${slug}/${name}`;
  // Files are named by target width; a crop narrower than the target is stored at its own width.
  const srcSet = [`${base}-1000.avif ${Math.min(1000, w)}w`, ...(w > 1000 ? [`${base}-2000.avif ${Math.min(2000, w)}w`] : [])].join(", ");

  useEffect(() => {
    const el = img.current ?? vid.current, n = noise.current, m = map.current;
    if (!el || !n || !m) return;
    // Images start hidden in CSS (shown again for reduced motion / no JS) so there's no flash before the reveal.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.style.opacity = "1"; return; }
    let frame = 0, seen = false;
    const set = (p: number) => {
      const k = 1 - (1 - p) ** 3;
      m.setAttribute("scale", String(PEAK * (1 - k)));
      n.setAttribute("seed", String(Math.floor(p * 40)));
      el.style.opacity = String(Math.min(1, p * 1.6));
      el.style.filter = `url(#${id}) blur(${(BLUR * (1 - k)).toFixed(2)}px)`;
    };
    const play = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / DURATION);
        set(p);
        if (p < 1) frame = requestAnimationFrame(tick);
        else { el.style.filter = "none"; vid.current?.play().catch(() => {}); }   // a video starts once it's fully in
      };
      frame = requestAnimationFrame(tick);
    };
    const ready = () => el instanceof HTMLVideoElement
      ? el.readyState >= 2 ? Promise.resolve() : new Promise<void>(r => el.addEventListener("loadeddata", () => r(), { once: true }))
      : el.complete && el.naturalWidth > 0 ? Promise.resolve() : new Promise<void>(r => el.addEventListener("load", () => r(), { once: true }));
    set(0);
    const io = new IntersectionObserver(([e]) => {
      if (seen || e.intersectionRatio < .2) return;
      seen = true; io.disconnect();
      ready().then(play);
    }, { threshold: [0, .2] });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [id]);

  return <div className={`cs-media ${className}`} style={{ aspectRatio: `${w} / ${h}` }}>
    <svg className="cs-noise-defs" aria-hidden="true"><filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence ref={noise} type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n" />
      <feDisplacementMap ref={map} in="SourceGraphic" in2="n" scale={PEAK} xChannelSelector="R" yChannelSelector="G" />
    </filter></svg>
    {video
      ? <video ref={vid} src={`${base}.mp4`} poster={`${base}.webp`} width={w} height={h} aria-label={alt}
          muted loop playsInline preload="auto" draggable={false} />
      : <picture>
          <source type="image/avif" srcSet={srcSet} sizes={sizes} />
          <img ref={img} src={`${base}.webp`} alt={alt} width={w} height={h} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : undefined} draggable={false} />
        </picture>}
  </div>;
}
