"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [{ label: "Index", href: "/" }, { label: "Work", href: "/#work" }, { label: "About", href: "/#about" }];

// Same fixed, difference-blended nav as the homepage: links tuck away once the page scrolls.
export function WorkNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <header className={`cs-nav${scrolled ? " is-scrolled" : ""}`}>
    <Link href="/" className="cs-logo">PETERSHKEN</Link>
    <nav aria-label="Main navigation"><ul>{links.map(l => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul></nav>
    {/* TODO: point at the real contact route once it exists. */}
    <Link className="cs-call" href="/#contact">Work with me</Link>
  </header>;
}

// Goes back to wherever the visitor came from on this site; otherwise to the work grid.
export function BackButton() {
  const router = useRouter();
  return <Link href="/#work" className="cs-back" onClick={e => {
    const fromHere = document.referrer && new URL(document.referrer).origin === location.origin;
    if (fromHere && history.length > 1) { e.preventDefault(); router.back(); }
  }}><span aria-hidden="true">←</span> <span className="cs-back-label">Back</span></Link>;
}
