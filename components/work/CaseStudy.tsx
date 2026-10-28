import Link from "next/link";
import type { MoreCard, Project } from "@/content/work";
import { BackButton, WorkNav } from "./Chrome";
import Gallery, { WIDE } from "./Gallery";
import Media from "./Media";
import Story from "./Story";
import styles from "./work.module.css";

// Case-study page, on black. The project itself leads: a pinned panel on the left holds the title, client,
// industry, services and a back button while the statement, story and images scroll on the right. Then more projects → wordmark.
// Phones follow koto.com: no nav, just a fixed back arrow, with the cover full-bleed above the title.
export default function CaseStudy({ project: p, more }: { project: Project; more: MoreCard[] }) {
  return <main className={styles.root}>
    <noscript><style>{".cs-media img{opacity:1}"}</style></noscript>
    <WorkNav />

    <div className="cs-project">
      <aside className="cs-side" aria-label="Project details">
        <h1 className="cs-title">{p.name}</h1>
        <dl className="cs-meta">
          <div><dt>Client</dt><dd>{p.client}</dd></div>
          <div><dt>Industry</dt><dd>{p.industry}</dd></div>
          <div><dt>Services</dt><dd><ul className="cs-pills">{p.services.map(s => <li key={s}>{s}</li>)}</ul></dd></div>
        </dl>
        <BackButton />
      </aside>
      <div className="cs-content">
        <div className="cs-intro">
          <h2 className="cs-statement">{p.statement}</h2>
          <Story paragraphs={p.story} />
        </div>
        {p.cover && <figure className="cs-fig cs-cover">
          <Media slug={p.slug} name={p.cover.name} alt={p.cover.alt} sizes={WIDE} eager />
        </figure>}
        <Gallery project={p} />
      </div>
    </div>

    <section className="cs-more" aria-labelledby="cs-more-title">
      <div className="cs-more-head">
        <p className="cs-more-kicker">( More projects )</p>
        <h2 id="cs-more-title">Continue through the work.</h2>
      </div>
      <ol className="cs-more-grid">
        {more.map((m, i) => <li key={m.slug}>
          <span className="cs-more-index">({String(i + 1).padStart(2, "0")})</span>
          <Link href={m.href} className="cs-more-card">
            <Media slug={m.slug} name={m.card} alt="" sizes="(max-width: 760px) 80vw, 32vw" />
            <span className="cs-more-name">{m.name} <span>— {m.line}</span></span>
          </Link>
        </li>)}
      </ol>
    </section>

    <footer className="cs-end">
      <div className="cs-end-row">
        <span>© {new Date().getFullYear()} Peter Pastor</span>
        <Link href="/#work">All work</Link>
        <a href="#">Back to top ↑</a>
      </div>
      <img className="cs-wordmark" src="/blur-wordmark.svg" alt="Blur" width={3782} height={2175} loading="lazy" />
    </footer>
  </main>;
}
