"use client";

import { useEffect } from "react";

// Entrances for hero chrome and plain copy. Each element waits in its "from" pose, then animates
// back to its own styles and the animation is dropped, so hover transitions keep working.
//   intro:  everything plays in order once the intro blinds start clearing.
//   scroll: each element plays once ~30% of it is in view; re-arms once it has fully left.
export type RevealKind = "rise" | "fade" | "pop";
export type RevealItem = [selector: string, kind: RevealKind];

// Figma Smart Animate, Linear: a straight dissolve + move between two states, no blur or overshoot.
const EASE = "linear";
const motion: Record<RevealKind, { from: Keyframe; duration: number; easing: string }> = {
  rise: { from: { opacity: 0, translate: "0 1em" }, duration: 600, easing: EASE },
  fade: { from: { opacity: 0 }, duration: 800, easing: EASE },
  pop: { from: { opacity: 0, scale: .6, rotate: "-12deg" }, duration: 600, easing: EASE },
};
const INTRO_DELAY = 250, INTRO_STAGGER = 70, SCROLL_STAGGER = 90, THRESHOLD = .3;

function arm(el: HTMLElement, kind: RevealKind) {
  const { from, duration, easing } = motion[kind];
  // A lone offset-0 keyframe animates towards the element's live styles.
  const animation = el.animate([{ ...from, offset: 0 }], { duration, easing, fill: "both" });
  animation.pause();
  animation.onfinish = () => animation.cancel();
  return [animation];
}
function play(animations: Animation[], delay: number) {
  for (const a of animations) { a.effect?.updateTiming({ delay }); a.currentTime = 0; a.play(); }
}
function rearm(animations: Animation[]) {
  for (const a of animations) { a.pause(); a.effect?.updateTiming({ delay: 0 }); a.currentTime = 0; }
}

export default function Reveal({ items, mode }: { items: RevealItem[]; mode: "intro" | "scroll" }) {
  const key = JSON.stringify(items);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const armed = new Map<HTMLElement, Animation[]>();
    for (const [selector, kind] of JSON.parse(key) as RevealItem[])
      document.querySelectorAll<HTMLElement>(selector).forEach(el => { if (!armed.has(el)) armed.set(el, arm(el, kind)); });
    const cancel = () => armed.forEach(list => list.forEach(a => a.cancel()));

    if (mode === "intro") {
      const reveal = () => {
        window.clearTimeout(fallback); window.removeEventListener("blur:intro-reveal", reveal);
        [...armed.values()].forEach((list, i) => play(list, INTRO_DELAY + i * INTRO_STAGGER));
      };
      window.addEventListener("blur:intro-reveal", reveal);
      // Never leave the hero hidden if the intro stalls or isn't on the page.
      const fallback = window.setTimeout(reveal, 16000);
      return () => { window.removeEventListener("blur:intro-reveal", reveal); window.clearTimeout(fallback); cancel(); };
    }

    // Measured from layout rather than IntersectionObserver, which treats an element's own
    // clip-path or mask as hidden, so a clipped-out pose would never report itself visible.
    const shown = new Set<HTMLElement>();
    let frame = 0;
    const check = () => {
      frame = 0;
      const h = window.innerHeight, entering: HTMLElement[] = [];
      armed.forEach((animations, el) => {
        const r = el.getBoundingClientRect(), visible = Math.min(r.bottom, h) - Math.max(r.top, 0);
        if (!shown.has(el) && visible >= Math.min(r.height, h) * THRESHOLD) entering.push(el);
        else if (shown.has(el) && visible <= 0) { shown.delete(el); rearm(animations); }
      });
      entering.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
        .forEach((el, i) => { shown.add(el); play(armed.get(el)!, Math.min(i, 6) * SCROLL_STAGGER); });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); cancel(); };
  }, [key, mode]);
  return null;
}
