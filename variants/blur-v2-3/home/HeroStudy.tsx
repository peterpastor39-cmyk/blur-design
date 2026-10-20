"use client";
import { useEffect, useRef, useState } from "react";
import CharacterHeadline from "./CharacterHeadline";
import WheelGallery from "./WheelGallery";
import FlickerField from "./FlickerField";
import ScrollStory from "./ScrollStory";
import IntroLoader from "./IntroLoader";
import NoiseHover from "./NoiseHover";
import Services from "./Services";
import MoreWork from "./MoreWork";
import styles from "./hero.module.css";
const FIGMA = "https://www.figma.com/design/TPJOv3OOOfSabSxcu7b00O/Blur-Landing-Page";
const links = [{ label: "Expertise", node: "375-351" }, { label: "Work", node: "375-291" }, { label: "About", node: "375-351" }, { label: "Contact", node: "375-274" }];
export default function HeroStudy() {
  const hero = useRef<HTMLElement>(null);
  const [time, setTime] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.body.style.overflow = "hidden"; window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [menuOpen]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit" }).format(new Date()));
    update(); const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, []);
  return <main className={styles.root}>
  <header className={`study-nav${scrolled ? " is-scrolled" : ""}`}>
    <a href={`${FIGMA}?node-id=375-253`} className="study-logo" aria-label="Blur Design — open the full design" target="_blank" rel="noreferrer"><img src="/blur-wordmark.svg" alt="Blur" /></a>
    <nav aria-label="Main navigation"><ul>{links.map(link => <li key={link.label}><a href={`${FIGMA}?node-id=${link.node}`} target="_blank" rel="noreferrer">{link.label}</a></li>)}</ul></nav>
    <a className="study-call" href={`${FIGMA}?node-id=375-276`} target="_blank" rel="noreferrer">Book a call <span aria-hidden="true">↗</span></a>
    <button type="button" className={`study-burger${menuOpen ? " is-open" : ""}`} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="study-mobile-menu" onClick={() => setMenuOpen(o => !o)}><span /><span /></button>
  </header>
  <nav id="study-mobile-menu" className={`study-mobile-menu${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}><ul>{links.map(link => <li key={link.label}><a href={`${FIGMA}?node-id=${link.node}`} target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>{link.label}</a></li>)}</ul></nav>
  <section className="study-hero" ref={hero} aria-label="Blur Design wheel gallery hero">
    <FlickerField />
    <CharacterHeadline enabled paused={false} />
    <WheelGallery hero={hero} />
    <div className="study-meta"><p>A strategy-led design studio specializing in<br className="study-desktop-break" /> laying down the awesome sauce.</p><p className="study-clock"><time>{time || "—:—"}</time><span>UTC+8</span></p></div>
  </section><ScrollStory /><MoreWork /><Services /><IntroLoader /><NoiseHover selector=".wheel-card, .story-media" /></main>;
}
