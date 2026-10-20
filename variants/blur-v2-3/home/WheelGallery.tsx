"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";

const projects = [
  { image: "tendr", title: "Tendr", alt: "Skincare packaging and brand design" },
  { image: "billboard", title: "Billboard", alt: "Red identity on an architectural billboard" },
  { image: "sonar-mark", title: "Sonar", alt: "Embossed Sonar brand mark" },
  { image: "business-cards", title: "Sonar identity", alt: "Sonar business card design" },
  { image: "knox-locker", title: "Knox Locker", alt: "Identity sketches and logo development" },
  { image: "sonar-mobile", title: "Sonar mobile", alt: "Sonar mobile interface" },
  { image: "sonar-dashboard", title: "Sonar dashboard", alt: "Sonar desktop dashboard" },
];

const STEP = Math.PI * 2 / projects.length;
const MAX_SCALE = 1.3, GAP = 1.12;
// Entrance spin when the intro loader lifts: fast at first, easing out to rest on a card.
const SPIN_TURNS = 2, SPIN_MS = 4500;
// Horizontal radius sized so neighbouring cards at the front never overlap.
function radiusFor(cardWidth: number) { return cardWidth * MAX_SCALE * GAP / (2 * Math.sin(STEP / 2)); }
// `open` (0–1) blends the wheel into the intro's wide orbit: a large, tilted, face-on
// ellipse (radii `wide` × `lift`) with upright cards, closing back to the wheel at 0.
const TILT = 18 * Math.PI / 180;
function placement(theta: number, radius = radiusFor(420), open = 0, wide = radius, lift = 0) {
  const cosine = Math.cos(theta), sine = Math.sin(theta);
  const across = sine * (radius + (wide - radius) * open), down = cosine * lift * open;
  const tilt = TILT * open;
  const x = across * Math.cos(tilt) - down * Math.sin(tilt), y = across * Math.sin(tilt) + down * Math.cos(tilt);
  const facing = Math.atan2(sine, cosine) * (1 - open);
  return `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, ${(cosine*1200*(1-.75*open)).toFixed(3)}px) rotateY(${(facing*180/Math.PI).toFixed(4)}deg) scale(${(.8+(cosine+1)*.25).toFixed(5)})`;
}

export default function WheelGallery({ hero }: { hero: RefObject<HTMLElement | null> }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const surface = hero.current, gallery = root.current;
    if (!surface || !gallery) return;
    const wheel = gallery.querySelector<HTMLElement>(".wheel-ring")!;
    const cards = [...gallery.querySelectorAll<HTMLElement>(".wheel-card")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, previous = 0, disposed = false;
    let angle = 0, target = 0, velocity = 0, dragging = false, pointer = -1;
    let lastX = 0, lastMove = 0;
    let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;
    let radius = radiusFor(cards[0]?.offsetWidth || 420);
    let spin: { from: number; to: number; start: number } | null = null, open = 0;

    function draw(now: number) {
      frame = 0;
      if (disposed || document.hidden) return;
      const dt = Math.max(0, (now - (previous || now)) / 1000);
      previous = now;
      const friction = .92 ** (dt * 60), smoothing = 1 - friction;
      if (reduced.matches) { angle = target; tiltX = 0; tiltY = 0; velocity = 0; }
      else {
        if (spin) {
          const t = Math.min(1, (now - spin.start) / SPIN_MS);
          target = angle = spin.from + (spin.to - spin.from) * (1 - (1 - t) ** 3);
          // Stays wide while it whips round, then draws in as it slows.
          open = 1 - (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
          velocity = 0;
          if (t === 1) spin = null;
        } else {
          if (!dragging) {
            target += velocity * (1-friction) / (-60*Math.log(.92));
            velocity *= friction;
          }
          open += (0-open)*smoothing;
          if (open < .0005) open = 0;
        }
        angle += (target-angle)*smoothing;
        tiltX += (targetX-tiltX)*smoothing; tiltY += (targetY-tiltY)*smoothing;
      }
      // Orbit size from the viewport (≈ 70% wide), allowing for perspective at the ring's depth.
      const wide = gallery!.clientWidth * .36 / .81, lift = gallery!.clientHeight * .2 / .81;
      wheel.style.transform = `translate3d(-50%, -50%, -700px) rotateX(${tiltX.toFixed(4)}deg) rotateY(${tiltY.toFixed(4)}deg)`;
      cards.forEach((card, i) => {
        const theta = angle + i*STEP, cosine = Math.cos(theta);
        const z = cosine*1200;
        card.style.transform = placement(theta, radius, open, wide, lift);
        card.style.zIndex = String(Math.round(10000+z));
        card.dataset.depth = z.toFixed(3);
      });
      gallery!.dataset.angle = angle.toFixed(6);
      gallery!.dataset.dragging = String(dragging);
      const settling = !!spin || open > 0 || Math.abs(target-angle) > .00001 || Math.abs(velocity) > .0001 || Math.abs(targetX-tiltX)+Math.abs(targetY-tiltY) > .002;
      if (settling) frame = requestAnimationFrame(draw);
    }
    function wake() {
      if (!frame && !disposed && !document.hidden) { previous = 0; frame = requestAnimationFrame(draw); }
    }
    function excluded(event: Event) { return event.target instanceof Element && !!event.target.closest("a,button,input,nav,.study-meta"); }
    function down(event: PointerEvent) {
      if (reduced.matches || event.button !== 0 || excluded(event)) return;
      spin = null; dragging = true; pointer = event.pointerId; lastX = event.clientX;
      lastMove = performance.now(); velocity = 0; surface!.setPointerCapture(pointer);
      gallery!.dataset.dragging = "true"; wake();
    }
    function move(event: PointerEvent) {
      if (reduced.matches || excluded(event)) return;
      const box = gallery!.getBoundingClientRect();
      if (event.pointerType !== "touch" && box.width >= 700) {
        targetX = -((event.clientY-box.top)/box.height-.5)*10;
        targetY = ((event.clientX-box.left)/box.width-.5)*10;
      }
      if (dragging && event.pointerId === pointer) {
        const now = performance.now(), dt = Math.max((now-lastMove)/1000,.008);
        const delta = (event.clientX-lastX)*.012;
        target += delta;
        velocity = Math.max(-4,Math.min(4,delta/dt))*.18;
        lastX = event.clientX; lastMove = now;
      }
      wake();
    }
    function up(event: PointerEvent) {
      if (event.pointerId !== pointer) return;
      const id = pointer; pointer = -1; dragging = false;
      if (performance.now()-lastMove>100 || event.type === "pointercancel") velocity = 0;
      if (surface!.hasPointerCapture(id)) surface!.releasePointerCapture(id);
      gallery!.dataset.dragging = "false"; wake();
    }
    function scroll(event: WheelEvent) {
      // Vertical scrolling belongs to the page now (scroll story below); only sideways scroll turns the wheel.
      if (event.ctrlKey || event.metaKey || excluded(event) || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery!.clientHeight : 1;
      target += event.deltaX*unit*.008; velocity = 0; wake();
    }
    function leave() { targetX = 0; targetY = 0; wake(); }
    function resize() { radius = radiusFor(cards[0]?.offsetWidth || 420); leave(); }
    function keys(event: KeyboardEvent) {
      if (event.target instanceof Element && !event.target.closest(".wheel-gallery")) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home") return;
      event.preventDefault(); target = event.key === "Home" ? 0 : target + (event.key === "ArrowRight" ? STEP : -STEP);
      velocity = 0; wake();
    }
    function visibility() {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (pointer !== -1 && surface!.hasPointerCapture(pointer)) surface!.releasePointerCapture(pointer);
      dragging = false; pointer = -1;
      if (!document.hidden) wake();
    }
    function preference() { targetX = 0; targetY = 0; velocity = 0; wake(); }
    function introSpin() {
      // Cards wait faded out behind the intro, then fade in one after another as the blinds clear.
      window.clearTimeout(unveilFallback); delete gallery!.dataset.intro;
      if (reduced.matches) return;
      spin = { from: angle, to: Math.ceil((angle + SPIN_TURNS * Math.PI * 2) / STEP) * STEP, start: performance.now() };
      open = 1;
      wake();
    }

    surface.addEventListener("pointerdown",down); surface.addEventListener("pointermove",move);
    surface.addEventListener("pointerup",up); surface.addEventListener("pointercancel",up);
    surface.addEventListener("lostpointercapture",up); surface.addEventListener("pointerleave",leave);
    surface.addEventListener("wheel",scroll,{passive:false});
    gallery.addEventListener("keydown",keys); window.addEventListener("resize",resize);
    document.addEventListener("visibilitychange",visibility); reduced.addEventListener("change",preference);
    window.addEventListener("blur:intro-reveal",introSpin);
    gallery.dataset.intro = "pending";
    // Never leave the wheel hidden if the intro stalls or isn't on the page.
    const unveilFallback = window.setTimeout(() => { delete gallery.dataset.intro; }, 16000);
    wake();
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      if (pointer !== -1 && surface.hasPointerCapture(pointer)) surface.releasePointerCapture(pointer);
      surface.removeEventListener("pointerdown",down); surface.removeEventListener("pointermove",move);
      surface.removeEventListener("pointerup",up); surface.removeEventListener("pointercancel",up);
      surface.removeEventListener("lostpointercapture",up); surface.removeEventListener("pointerleave",leave);
      surface.removeEventListener("wheel",scroll); gallery.removeEventListener("keydown",keys); window.removeEventListener("resize",resize);
      document.removeEventListener("visibilitychange",visibility); reduced.removeEventListener("change",preference);
      window.removeEventListener("blur:intro-reveal",introSpin); window.clearTimeout(unveilFallback);
    };
  },[hero]);

  return <div ref={root} className="wheel-gallery" tabIndex={0} role="group" aria-label="Project image wheel. Drag, scroll, or use the arrow keys to rotate.">
    <div className="wheel-camera"><div className="wheel-ring">
      {projects.map((project,i)=><figure className="wheel-card" key={project.image} style={{ "--i": i, transform: placement(i*STEP), zIndex: Math.round(10000+Math.cos(i*STEP)*1200) } as CSSProperties}>
        <img src={`/hero-images/${project.image}.webp`} alt={project.alt} draggable={false} decoding="async" />
      </figure>)}
    </div></div>
  </div>;
}
