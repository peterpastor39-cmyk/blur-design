"use client";

import { useEffect, useRef, type RefObject } from "react";

const projects = [
  { name: "billboard", alt: "Red brand billboard on a building" },
  { name: "tendr", alt: "Tendr skincare packaging" },
  { name: "sonar-mark", alt: "Sonar embossed brand mark" },
  { name: "business-cards", alt: "Sonar business card design" },
  { name: "knox-locker", alt: "Knox Locker identity sketches" },
  { name: "sonar-mobile", alt: "Sonar mobile interface" },
  { name: "sonar-dashboard", alt: "Sonar desktop dashboard" },
];

// Settings inspected in the user's OrbitSphereGalleryMask Framer instance.
const RADIUS = 400, CARD_SIZE = 200, AUTO_SPEED = 10 * Math.PI / 180;
const DRAG_SENSITIVITY = .25, MOMENTUM = .88;
type Vector = [number, number, number];
type Quaternion = [number, number, number, number];

function random(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

// Even spherical distribution, with deterministic radius and size variation.
const positions = projects.map((_, i) => {
  const y = 1 - 2 * (i + .5) / projects.length;
  const ring = Math.sqrt(1 - y * y), angle = i * Math.PI * (3 - Math.sqrt(5));
  const radius = RADIUS * (1 + (random(i + 1) * 2 - 1) * .2);
  return {
    point: [Math.cos(angle) * ring * radius, y * radius, Math.sin(angle) * ring * radius] as Vector,
    size: 1 + (random(i + 31) * 2 - 1) * .4,
  };
});

function multiply(a: Quaternion, b: Quaternion): Quaternion {
  return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1], a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0], a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3], a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
}

function rotate([x, y, z]: Vector, q: Quaternion): Vector {
  const tx = 2*(q[1]*z-q[2]*y), ty = 2*(q[2]*x-q[0]*z), tz = 2*(q[0]*y-q[1]*x);
  return [x+q[3]*tx+q[1]*tz-q[2]*ty, y+q[3]*ty+q[2]*tx-q[0]*tz, z+q[3]*tz+q[0]*ty-q[1]*tx];
}

// The inspected reveal uses cubic-bezier(.77, 0, .175, 1).
function revealEase(progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  let low = 0, high = 1, u = t;
  for (let i = 0; i < 12; i++) {
    const x = 3*(1-u)**2*u*.77 + 3*(1-u)*u*u*.175 + u**3;
    if (x < t) low = u; else high = u;
    u = (low + high) / 2;
  }
  return 3*(1-u)*u*u + u**3;
}

export default function FloatingProjects({ paused, hero }: { paused: boolean; hero: RefObject<HTMLElement | null> }) {
  const layer = useRef<HTMLDivElement>(null);
  const pause = useRef(paused), wake = useRef<() => void>(() => {});
  useEffect(() => { pause.current = paused; wake.current(); }, [paused]);

  useEffect(() => {
    const surface = hero.current, gallery = layer.current;
    if (!surface || !gallery) return;
    const cards = Array.from(gallery.querySelectorAll<HTMLElement>(".orbit-position")).map(element => ({
      element, mask: element.querySelector<HTMLElement>(".orbit-mask")!, image: element.querySelector<HTMLImageElement>("img")!,
    }));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let quaternion: Quaternion = [0, 0, 0, 1];
    let frame = 0, previous = 0, elapsed = 0, disposed = false;
    let scale = 1, perspective = 1560, dragging = false, activePointer = -1;
    let lastX = 0, lastY = 0, lastMove = 0, velocityX = 0, velocityY = 0;

    function turn(x: number, y: number, z: number) {
      const angle = Math.hypot(x, y, z);
      if (angle < .000001) return;
      const sin = Math.sin(angle/2)/angle;
      quaternion = multiply([x*sin, y*sin, z*sin, Math.cos(angle/2)], quaternion);
      const length = Math.hypot(...quaternion);
      quaternion = quaternion.map(value => value/length) as Quaternion;
    }

    function draw(now: number) {
      frame = 0;
      if (disposed || document.hidden) return;
      const dt = Math.max(0, (now-(previous || now))/1000);
      previous = now;
      const moving = !pause.current && !reduced.matches;
      if (moving) {
        elapsed += dt;
        if (!dragging) {
          // Ambient axis is tilted 45 degrees; drag rotates in world space.
          const decay = MOMENTUM ** (dt*60);
          // Integrate momentum over real elapsed time, including throttled frames.
          const momentumTime = (1-decay)/(-60*Math.log(MOMENTUM));
          turn(AUTO_SPEED*Math.SQRT1_2*dt+velocityX*momentumTime, AUTO_SPEED*Math.SQRT1_2*dt+velocityY*momentumTime, 0);
          velocityX *= decay; velocityY *= decay;
        }
      }
      const points = positions.map(({ point }) => rotate(point, quaternion));
      const order = points.map((p, i) => ({ z: p[2], i })).sort((a,b) => a.z-b.z);
      const ranks = new Map(order.map((item, index) => [item.i, index]));
      cards.forEach(({ element, mask, image }, i) => {
        const [x, y, z] = points[i];
        const reveal = reduced.matches ? 1 : revealEase((elapsed-.8-i*.15)/.8);
        // Project a 3D point, keeping its image facing the viewer.
        const depthScale = perspective/(perspective-z*scale);
        const size = scale*positions[i].size*depthScale;
        element.style.transform = `translate3d(${(x*scale*depthScale).toFixed(3)}px, ${(y*scale*depthScale).toFixed(3)}px, 0) scale(${size.toFixed(5)})`;
        element.style.zIndex = String(ranks.get(i));
        mask.style.clipPath = reveal >= .999 ? "none" : `inset(${((1-reveal)*100).toFixed(3)}% 0 0 0)`;
        mask.style.visibility = reveal <= .001 ? "hidden" : "visible";
        image.style.transform = `scale(${(1+(1-reveal)*.5).toFixed(5)})`;
        element.dataset.depth = z.toFixed(2);
      });
      gallery!.dataset.rotation = quaternion.map(value => value.toFixed(5)).join(",");
      gallery!.dataset.dragging = String(dragging);
      gallery!.dataset.revealed = String(reduced.matches || elapsed >= 2.5);
      if (moving) frame = requestAnimationFrame(draw);
    }

    function requestDraw() {
      if (!frame && !disposed && !document.hidden) { previous = 0; frame = requestAnimationFrame(draw); }
    }
    function resize() {
      const { width, height } = surface!.getBoundingClientRect();
      // Match the inspected 1200×800 preview's scale; fit narrower screens.
      scale = Math.min(width/(width < 700 ? 650 : 1200), height/800)*.506912;
      perspective = Math.max(width, height)*1.3;
      gallery!.style.setProperty("--orbit-card-size", `${CARD_SIZE}px`);
      requestDraw();
    }
    function excluded(target: EventTarget | null) {
      return target instanceof Element && !!target.closest("a, button, input, nav, .study-meta, .study-controls");
    }
    function down(event: PointerEvent) {
      if (pause.current || reduced.matches || event.button !== 0 || excluded(event.target)) return;
      dragging = true; activePointer = event.pointerId;
      lastX = event.clientX; lastY = event.clientY; lastMove = performance.now();
      velocityX = 0; velocityY = 0;
      surface!.setPointerCapture(event.pointerId);
      gallery!.dataset.dragging = "true"; requestDraw();
    }
    function move(event: PointerEvent) {
      if (!dragging || event.pointerId !== activePointer || pause.current || reduced.matches) return;
      const now = performance.now(), dt = Math.max((now-lastMove)/1000, .008);
      const x = -(event.clientY-lastY)*.01*DRAG_SENSITIVITY, y = (event.clientX-lastX)*.01*DRAG_SENSITIVITY;
      turn(x,y,0);
      velocityX = Math.max(-2, Math.min(2, x/dt)); velocityY = Math.max(-2, Math.min(2, y/dt));
      lastX = event.clientX; lastY = event.clientY; lastMove = now;
    }
    function up(event: PointerEvent) {
      if (event.pointerId !== activePointer) return;
      dragging = false; activePointer = -1;
      if (performance.now()-lastMove > 100 || event.type === "pointercancel") { velocityX = 0; velocityY = 0; }
      if (surface!.hasPointerCapture(event.pointerId)) surface!.releasePointerCapture(event.pointerId);
      gallery!.dataset.dragging = "false";
    }
    function wheel(event: WheelEvent) {
      if (pause.current || reduced.matches || event.ctrlKey || event.metaKey || excluded(event.target)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? surface!.clientHeight : 1;
      const x = Math.max(-.45, Math.min(.45, event.deltaY*unit*.0025));
      const y = Math.max(-.45, Math.min(.45, event.deltaX*unit*.0025));
      turn(x,y,0); velocityX = x*4; velocityY = y*4; requestDraw();
    }
    function visibility() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; previous = 0; dragging = false; activePointer = -1;
      gallery!.dataset.dragging = "false";
      if (!document.hidden) requestDraw();
    }
    function preference() { velocityX = 0; velocityY = 0; requestDraw(); }

    wake.current = requestDraw;
    const observer = new ResizeObserver(resize);
    observer.observe(surface); resize();
    surface.addEventListener("pointerdown", down); surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerup", up); surface.addEventListener("pointercancel", up);
    surface.addEventListener("lostpointercapture", up); surface.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("visibilitychange", visibility); reduced.addEventListener("change", preference);
    return () => {
      disposed = true; wake.current = () => {}; cancelAnimationFrame(frame); observer.disconnect();
      if (activePointer !== -1 && surface.hasPointerCapture(activePointer)) surface.releasePointerCapture(activePointer);
      surface.removeEventListener("pointerdown", down); surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", up); surface.removeEventListener("pointercancel", up);
      surface.removeEventListener("lostpointercapture", up); surface.removeEventListener("wheel", wheel);
      document.removeEventListener("visibilitychange", visibility); reduced.removeEventListener("change", preference);
    };
  }, [hero]);

  return (
    <div className="orbit-gallery" ref={layer} data-paused={paused} data-dragging="false" aria-label="Selected design projects in a rotating sphere">
      {projects.map(project => (
        <div className="orbit-position" key={project.name}>
          <div className="orbit-center"><div className="orbit-mask"><div className="orbit-hover">
            <img src={`/hero-images/${project.name}.webp`} alt={project.alt} draggable={false} decoding="async" />
          </div></div></div>
        </div>
      ))}
    </div>
  );
}
