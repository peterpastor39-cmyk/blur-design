"use client";
import { useEffect, useRef, useState } from "react";
import CharacterHeadline from "./CharacterHeadline";
import WheelGallery from "./WheelGallery";
import FlickerField from "./FlickerField";
import ScrollStory from "./ScrollStory";
import IntroLoader from "./IntroLoader";
import styles from "./hero.module.css";
const FIGMA = "https://www.figma.com/design/TPJOv3OOOfSabSxcu7b00O/Blur-Landing-Page";
const links = [{ label: "Expertise", node: "375-351" }, { label: "Work", node: "375-291" }, { label: "About", node: "375-351" }, { label: "Contact", node: "375-274" }];
export default function HeroStudy() {
  const hero = useRef<HTMLElement>(null);
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit" }).format(new Date()));
    update(); const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, []);
  return <main className={styles.root}><section className="study-hero" ref={hero} aria-label="Blur Design wheel gallery hero">
    <header className="study-nav">
      <a href={`${FIGMA}?node-id=375-253`} className="study-logo" aria-label="Blur Design — open the full design" target="_blank" rel="noreferrer"><img src="/blur-wordmark.svg" alt="Blur" /></a>
      <nav aria-label="Main navigation"><ul>{links.map(link => <li key={link.label}><a href={`${FIGMA}?node-id=${link.node}`} target="_blank" rel="noreferrer">{link.label}</a></li>)}</ul></nav>
      <a className="study-call" href={`${FIGMA}?node-id=375-276`} target="_blank" rel="noreferrer">Book a call <span aria-hidden="true">↗</span></a>
    </header>
    <FlickerField />
    <CharacterHeadline enabled paused={false} />
    <WheelGallery hero={hero} />
    <div className="study-meta"><p>A strategy-led design studio specializing in<br className="study-desktop-break" /> laying down the awesome sauce.</p><p className="study-clock"><time>{time || "—:—"}</time><span>UTC+8</span></p></div>
  </section><ScrollStory /><IntroLoader /></main>;
}
