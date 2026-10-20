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
import NameStory from "./NameStory";
import styles from "./hero.module.css";
const FIGMA = "https://www.figma.com/design/TPJOv3OOOfSabSxcu7b00O/Blur-Landing-Page";
// TODO: swap in the real profile URLs.
const socials = [{ label: "Instagram", href: "#" }, { label: "Behance", href: "#" }];
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
    <a className="study-call" href={`${FIGMA}?node-id=375-276`} target="_blank" rel="noreferrer">Start a project <span aria-hidden="true">↗</span></a>
    <button type="button" className={`study-burger${menuOpen ? " is-open" : ""}`} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="study-mobile-menu" onClick={() => setMenuOpen(o => !o)}><span /><span /></button>
  </header>
  <nav id="study-mobile-menu" className={`study-mobile-menu${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}><ul>{links.map(link => <li key={link.label}><a href={`${FIGMA}?node-id=${link.node}`} target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>{link.label}</a></li>)}</ul></nav>
  <section className="study-hero" ref={hero} aria-label="Blur Design wheel gallery hero">
    <FlickerField />
    <CharacterHeadline enabled paused={false} />
    <WheelGallery hero={hero} />
    <div className="study-meta"><ul className="study-social">{socials.map(s => <li key={s.label}><a href={s.href} aria-label={s.label} target="_blank" rel="noreferrer">{s.label === "Instagram"
      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
      : <svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="currentColor">Bē</text></svg>}</a></li>)}</ul><p className="study-clock"><time>{time || "—:—"}</time><span>UTC+8</span></p></div>
  </section><ScrollStory /><NameStory /><MoreWork /><Services /><IntroLoader /><NoiseHover selector=".wheel-card, .story-media, .more-media" /></main>;
}
