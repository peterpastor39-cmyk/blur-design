import type { Figure, Project } from "@/content/work";
import Media from "./Media";

const pad = (n: number) => String(n).padStart(2, "0");
const WIDE = "(max-width: 760px) 100vw, 70vw", HALF = "(max-width: 760px) 100vw, 35vw";

// The project's images: cover first, then the wide / pair rhythm.
// Decision notes sit between rows, right after the figure they explain.
export default function Gallery({ project }: { project: Project }) {
  let n = 0, d = 0;
  const fig = (f: Figure, sizes: string) => <figure key={f.name} className="cs-fig">
    <Media slug={project.slug} name={f.name} alt={f.alt} sizes={sizes} />
    <figcaption className="cs-sr">Fig. {pad(++n)} — {f.caption}</figcaption>
  </figure>;
  const note = (f: Figure) => f.decision && <aside key={`${f.name}-note`} className="cs-decision">
    <p className="cs-label">Decision {pad(++d)}</p>
    <div><h3>{f.decision.title}</h3><p>{f.decision.body}</p></div>
  </aside>;

  return <section className="cs-gallery" aria-label={`${project.name} images`}>
    <figure className="cs-fig cs-cover">
      <Media slug={project.slug} name={project.cover.name} alt={project.cover.alt} sizes={WIDE} eager />
    </figure>
    {project.rows.map(r => r.kind === "wide"
      ? [<div key={r.fig.name} className="cs-row cs-row--wide">{fig(r.fig, WIDE)}</div>, note(r.fig)]
      : [<div key={r.figs[0].name} className="cs-row cs-row--pair">{r.figs.map(f => fig(f, HALF))}</div>, ...r.figs.map(note)])}
  </section>;
}
