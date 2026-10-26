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
const LOOP = 4000;
const swapDelay = (elapsed: number) => 100 + 400 * (1 - Math.sin(Math.min(elapsed / LOOP, 1) * Math.PI));
const EASE = "power4.inOut";

function decoded(img: HTMLImageElement) {
  return img.complete ? Promise.resolve() : img.decode().catch(() => undefined);
}

export default function IntroLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [grid, setGrid] = useState<{ cols: number; rows: number } | null>(null);

  // Size the blind grid to the viewport: ~18 square columns on desktop, 8 on phones.
  useGSAP(() => {
    const cols = window.innerWidth < 700 ? 8 : 18;
    setGrid({ cols, rows: Math.ceil(window.innerHeight / (window.innerWidth / cols)) });
  }, []);

  useGSAP(() => {
    const el = root.current;
    if (!el || !grid) return;
    const q = gsap.utils.selector(el);
    const pieces = q(`.${styles.glyph}`);
    const mark = q(`.${styles.mark}`)[0] as HTMLElement;
    const u = q(`.${styles.u} .${styles.glyph}`)[0] as HTMLElement;
    const shots = q(`.${styles.shot}`) as HTMLElement[];
    const count = q(`.${styles.count}`)[0] as HTMLElement;
    const stage = q(`.${styles.stage}`)[0] as HTMLElement;
    const cells = q(`.${styles.cell}`) as HTMLElement[];

    // Arriving at a section link (e.g. "/#work" from a case study's Back): skip the intro and land there.
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (target) {
      gsap.set(el, { autoAlpha: 0 });
      window.dispatchEvent(new CustomEvent("blur:intro-reveal"));
      setDone(true);
      window.setTimeout(() => target.scrollIntoView());
      return;
    }

    // Otherwise the intro always opens on the hero: stop the browser restoring the last
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
    const reveal = () => window.dispatchEvent(new CustomEvent("blur:intro-reveal"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(shots, { autoAlpha: 0 });
      gsap.timeline({ delay: 1, onComplete: finish }).call(reveal).to(el, { autoAlpha: 0, duration: 0.4 });
      return () => { cancelled = true; release(); };
    }

    gsap.set(shots, { autoAlpha: 0 });
    gsap.set(pieces, { yPercent: 100 });
    
    // Blinds clear from the bottom row in a checkerboard: alternate squares lead,
    // their neighbours follow half a beat behind, with a touch of jitter.
    const { cols, rows } = grid;
    const order = (i: number) => {
      const r = Math.floor(i / cols), c = i % cols;
      return (rows - 1 - r) * 0.035 + ((r + c) % 2) * 0.06 + Math.random() * 0.02;
    };

    // 3. Close: the u returns, then the black breaks into a checkerboard of
    //    squares that drop away from the bottom row up, uncovering the hero.
    const close = () => {
      if (cancelled) return;
      gsap.timeline({ onComplete: finish })
        .set(shots, { autoAlpha: 0 }, 0.15)
        .to(mark, { columnGap: 0, duration: 0.45, ease: "power3.inOut" }, 0)
        .set(u, { autoAlpha: 1 }, 0.15)
        .to(count, { autoAlpha: 0, duration: 0.3 }, 0)
        .add("blinds", 0.5)
        .set(stage, { backgroundColor: "transparent" }, "blinds")
        .call(release, undefined, "blinds")
        .call(reveal, undefined, "blinds")
        .to(mark, { autoAlpha: 0, duration: 0.35, ease: "power2.out" }, "blinds")
        .to(cells, { scaleY: 0, duration: 0.28, ease: "none", delay: (i: number) => order(i) }, "blinds");
    };

    // 2. Loop: hard swaps that speed up then slow down, each new image popping in.
    let current = 0;
    const swap = (start: number) => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      if (elapsed >= LOOP) return close();
      timer = window.setTimeout(() => {
        gsap.set(shots[current], { autoAlpha: 0 });
        current = (current + 1) % shots.length;
        gsap.fromTo(shots[current], { autoAlpha: 1, scale: 0.85 }, { scale: 1, duration: 0.3, ease: "back.out(1.4)", overwrite: true });
        swap(start);
      }, swapDelay(elapsed));
    };

    // Counts up to 100 exactly as the image loop ends.
    const counter = { value: 0 };
    const countUp = () => gsap.to(counter, {
      value: 100, duration: LOOP / 1000, ease: "power2.inOut",
      onUpdate: () => { count.textContent = String(Math.round(counter.value)).padStart(3, "0"); },
    });

    // 1. Open: "Blur." rises into place, then the u gives its seat to the image stack.
    const open = gsap.timeline({ paused: true })
      .to(pieces, { yPercent: 0, duration: 1, ease: EASE, stagger: 0.06 })
      .set(u, { autoAlpha: 0 }, "+=0.35")
      .to(mark, { columnGap: () => mark.offsetHeight * 0.1, duration: 0.6, ease: EASE }, "<")
      .fromTo(shots[0], { autoAlpha: 1, scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(1.2)" }, "<")
      .add(() => { countUp(); swap(performance.now()); });

    // Wait for the images to be ready (capped so a slow network never blocks the page).
    let started = false;
    const start = () => { if (!started && !cancelled) { started = true; open.play(); } };
    Promise.all(Array.from(el.querySelectorAll("img"), decoded)).then(start);
    const cap = window.setTimeout(start, 2500);
    // Animation frames pause in background tabs; never leave the page locked behind a stalled intro.
    const failsafe = window.setTimeout(finish, 2500 + open.duration() * 1000 + LOOP + 8000);

    return () => { cancelled = true; window.clearTimeout(cap); window.clearTimeout(failsafe); window.clearTimeout(timer); gsap.killTweensOf(counter); release(); };
  }, { scope: root, dependencies: [grid] });

  if (done) return null;
  return (
    <div className={styles.intro} ref={root} aria-hidden="true">
      <div className={styles.stage}>
        <div className={styles.mark}>
          <span className={styles.piece}><img className={styles.glyph} src="/blur-mark-bl.svg" alt="" /></span>
          <span className={styles.u}>
            <span className={styles.piece}><img className={styles.glyph} src="/blur-mark-u.svg" alt="" /></span>
            <span className={styles.slot}>
              {images.map(name => (
                <span className={styles.shot} key={name}><img src={`/hero-images/${name}.webp`} alt="" decoding="async" /></span>
              ))}
            </span>
          </span>
          <span className={styles.piece}><img className={styles.glyph} src="/blur-mark-r.svg" alt="" /></span>
        </div>
        <p className={styles.count}>000</p>
      </div>
      {grid && (
        <div className={styles.blinds} style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, calc(100vw / ${grid.cols}))` }}>
          {Array.from({ length: grid.cols * grid.rows }, (_, i) => <span className={styles.cell} key={i} />)}
        </div>
      )}
    </div>
  );
}
