"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./intro.module.css";

gsap.registerPlugin(useGSAP);

// Optimised copies of the files in /hero images.
const images = ["sonar-mark", "billboard", "knox-locker", "business-cards", "sonar-mobile", "tendr", "sonar-dashboard"];

// Rhythm taken from noth.in's loader: images swap on a sine curve — 500ms apart,
// quickening to 100ms half-way, easing back to 500ms by the end of the loop.
const LOOP = 5000;
const swapDelay = (elapsed: number) => 100 + 400 * (1 - Math.sin(Math.min(elapsed / LOOP, 1) * Math.PI));
const EASE = "power4.inOut";

function decoded(img: HTMLImageElement) {
  return img.complete ? Promise.resolve() : img.decode().catch(() => undefined);
}

export default function IntroLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const pieces = q(`.${styles.piece} img`);
    const gap = q(`.${styles.gap}`)[0] as HTMLElement;
    const shots = q(`.${styles.shot}`) as HTMLElement[];
    const count = q(`.${styles.count}`)[0] as HTMLElement;

    // The intro always opens on the hero: stop the browser restoring the last
    // scroll position on reload, and hold the page at the top while it plays.
    history.scrollRestoration = "manual";
    const top = () => { if (window.scrollY) window.scrollTo(0, 0); };
    top();
    window.addEventListener("scroll", top);
    document.documentElement.style.overflow = "hidden";
    const release = () => { window.removeEventListener("scroll", top); document.documentElement.style.overflow = ""; };

    let cancelled = false, timer = 0;
    // The component stays mounted after the intro, so unlock here rather than in cleanup.
    const finish = () => { window.clearTimeout(timer); release(); if (!cancelled) setDone(true); };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(shots, { autoAlpha: 0 });
      gsap.timeline({ delay: 1, onComplete: finish }).to(el, { autoAlpha: 0, duration: 0.4 });
      return () => { cancelled = true; release(); };
    }

    const tight = gap.offsetWidth;
    gsap.set(shots, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    gsap.set(pieces, { yPercent: 100 });

    // 3. Close: last image shrinks away, the mark closes back to "Blur", the curtain lifts.
    const close = () => {
      if (cancelled) return;
      gsap.timeline({ onComplete: finish })
        .to(shots, { scale: 0, duration: 0.6, ease: EASE }, 0.5)
        .to(gap, { width: tight, duration: 0.8, ease: EASE }, 0.6)
        .to(count, { autoAlpha: 0, duration: 0.5, ease: EASE }, 1.5)
        .call(release, undefined, 1.8)
        .to(el, { height: 0, duration: 1.8, ease: EASE }, 1.8)
        .to(pieces, { yPercent: 100, duration: 1, ease: EASE }, 1.8);
    };

    // 2. Loop: hard swaps that speed up then slow down, each new image popping in.
    let current = 0;
    const swap = (start: number) => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      if (elapsed >= LOOP) return close();
      timer = window.setTimeout(() => {
        const prev = shots[current];
        gsap.killTweensOf(prev);
        gsap.set(prev, { autoAlpha: 0, scale: 1, rotate: 0 });
        current = (current + 1) % shots.length;
        gsap.fromTo(shots[current], { autoAlpha: 0, scale: 0.8, rotate: 0 }, { autoAlpha: 1, scale: 1, duration: 0.32, ease: "back.out(1.2)", overwrite: true });
        swap(start);
      }, swapDelay(elapsed));
    };

    const counter = { value: 100 };
    const countdown = () => gsap.to(counter, {
      value: 0, duration: LOOP / 1000 + 1.4, ease: "power2.inOut",
      onUpdate: () => { count.textContent = String(Math.round(counter.value)).padStart(3, "0"); },
    });

    // 1. Open: B and "lur" rise into place, then part to make room for the first image.
    const open = gsap.timeline({ paused: true })
      .to(pieces, { yPercent: 0, duration: 1, ease: EASE })
      .to(gap, { width: () => shots[0].offsetWidth * 1.2, duration: 1.2, ease: EASE })
      .fromTo(shots[0], { autoAlpha: 1, scale: 0 }, { scale: 1, rotate: 15, duration: 0.8, ease: "back.out(0.9)" }, "<0.5")
      .add(() => { countdown(); swap(performance.now()); });

    // Wait for the images to be ready (capped so a slow network never blocks the page).
    let started = false;
    const start = () => { if (!started && !cancelled) { started = true; open.play(); } };
    Promise.all(Array.from(el.querySelectorAll("img"), decoded)).then(start);
    const cap = window.setTimeout(start, 2500);
    // Animation frames pause in background tabs; never leave the page locked behind a stalled intro.
    const failsafe = window.setTimeout(finish, 2500 + open.duration() * 1000 + LOOP + 6000);

    return () => { cancelled = true; window.clearTimeout(cap); window.clearTimeout(failsafe); window.clearTimeout(timer); gsap.killTweensOf(counter); release(); };
  }, { scope: root });

  if (done) return null;
  return (
    <div className={styles.intro} ref={root} aria-hidden="true">
      <div className={styles.stage}>
        <div className={styles.mark}>
          <span className={styles.piece}><img src="/blur-mark-b.svg" alt="" /></span>
          <span className={styles.gap}>
            {images.map(name => (
              <span className={styles.shot} key={name}><img src={`/hero-images/${name}.webp`} alt="" decoding="async" /></span>
            ))}
          </span>
          <span className={styles.piece}><img src="/blur-mark-lur.svg" alt="" /></span>
        </div>
        <p className={styles.count}>100</p>
      </div>
    </div>
  );
}
