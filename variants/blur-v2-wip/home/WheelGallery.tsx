"use client";

import { useEffect, useRef, type RefObject } from "react";

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
function placement(theta: number) {
  const cosine = Math.cos(theta);
  return `translate3d(${(Math.sin(theta)*400).toFixed(3)}px, 0px, ${(cosine*1200).toFixed(3)}px) rotateY(${(theta*180/Math.PI).toFixed(4)}deg) scale(${(.8+(cosine+1)*.25).toFixed(5)})`;
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

    function draw(now: number) {
      frame = 0;
      if (disposed || document.hidden) return;
      const dt = Math.max(0, (now - (previous || now)) / 1000);
      previous = now;
      const friction = .92 ** (dt * 60), smoothing = 1 - friction;
      if (reduced.matches) { angle = target; tiltX = 0; tiltY = 0; velocity = 0; }
      else {
        if (!dragging) {
          target += velocity * (1-friction) / (-60*Math.log(.92));
          velocity *= friction;
        }
        angle += (target-angle)*smoothing;
        tiltX += (targetX-tiltX)*smoothing; tiltY += (targetY-tiltY)*smoothing;
      }
      wheel.style.transform = `translate3d(-50%, -50%, -700px) rotateX(${tiltX.toFixed(4)}deg) rotateY(${tiltY.toFixed(4)}deg)`;
      cards.forEach((card, i) => {
        const theta = angle + i*STEP, cosine = Math.cos(theta);
        const z = cosine*1200;
        card.style.transform = placement(theta);
        card.style.zIndex = String(Math.round(10000+z));
        card.dataset.depth = z.toFixed(3);
      });
      gallery!.dataset.angle = angle.toFixed(6);
      gallery!.dataset.dragging = String(dragging);
      const settling = Math.abs(target-angle) > .00001 || Math.abs(velocity) > .0001 || Math.abs(targetX-tiltX)+Math.abs(targetY-tiltY) > .002;
      if (settling) frame = requestAnimationFrame(draw);
    }
    function wake() {
      if (!frame && !disposed && !document.hidden) { previous = 0; frame = requestAnimationFrame(draw); }
    }
    function excluded(event: Event) { return event.target instanceof Element && !!event.target.closest("a,button,input,nav,.study-meta"); }
    function down(event: PointerEvent) {
      if (reduced.matches || event.button !== 0 || excluded(event)) return;
      dragging = true; pointer = event.pointerId; lastX = event.clientX;
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
        const delta = (event.clientX-lastX)*.05;
        target += delta;
        velocity = Math.max(-12,Math.min(12,delta/dt))*.18;
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
      if (event.ctrlKey || event.metaKey || excluded(event)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery!.clientHeight : 1;
      target += (event.deltaY+event.deltaX)*unit*.025; velocity = 0; wake();
    }
    function leave() { targetX = 0; targetY = 0; wake(); }
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

    surface.addEventListener("pointerdown",down); surface.addEventListener("pointermove",move);
    surface.addEventListener("pointerup",up); surface.addEventListener("pointercancel",up);
    surface.addEventListener("lostpointercapture",up); surface.addEventListener("pointerleave",leave);
    surface.addEventListener("wheel",scroll,{passive:false});
    gallery.addEventListener("keydown",keys); window.addEventListener("resize",leave);
    document.addEventListener("visibilitychange",visibility); reduced.addEventListener("change",preference);
    wake();
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      if (pointer !== -1 && surface.hasPointerCapture(pointer)) surface.releasePointerCapture(pointer);
      surface.removeEventListener("pointerdown",down); surface.removeEventListener("pointermove",move);
      surface.removeEventListener("pointerup",up); surface.removeEventListener("pointercancel",up);
      surface.removeEventListener("lostpointercapture",up); surface.removeEventListener("pointerleave",leave);
      surface.removeEventListener("wheel",scroll); gallery.removeEventListener("keydown",keys); window.removeEventListener("resize",leave);
      document.removeEventListener("visibilitychange",visibility); reduced.removeEventListener("change",preference);
    };
  },[hero]);

  return <div ref={root} className="wheel-gallery" tabIndex={0} role="group" aria-label="Project image wheel. Drag, scroll, or use the arrow keys to rotate.">
    <div className="wheel-camera"><div className="wheel-ring">
      {projects.map((project,i)=><figure className="wheel-card" key={project.image} style={{ transform: placement(i*STEP), zIndex: Math.round(10000+Math.cos(i*STEP)*1200) }}>
        <img src={`/hero-images/${project.image}.webp`} alt={project.alt} draggable={false} decoding="async" />
      </figure>)}
    </div></div>
  </div>;
}
