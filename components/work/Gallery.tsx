import type { Figure, Project } from "@/content/work";
import Media from "./Media";

const pad = (n: number) => String(n).padStart(2, "0");
export const WIDE = "(max-width: 760px) 100vw, 70vw";
const HALF = "(max-width: 760px) 50vw, 35vw";

// The project's images in a wide / pair rhythm (the cover is placed by CaseStudy).
// Decision notes sit between rows, right after the figure they explain.
export default function Gallery({ project }: { project: Project }) {
  let n = 0, d = 0;
  const fig = (f: Figure, sizes: string) => <figure key={f.name} className={f.native ? "cs-fig cs-fig--native" : "cs-fig"}>
    <Media slug={project.slug} name={f.name} alt={f.alt} sizes={sizes} video={f.video} />
    <figcaption className="cs-sr">Fig. {pad(++n)} — {f.caption}</figcaption>
  </figure>;
  const note = (f: Figure) => f.decision && <aside key={`${f.name}-note`} className="cs-decision">
    <p className="cs-label">Decision {pad(++d)}</p>
    <div><h3>{f.decision.title}</h3><p>{f.decision.body}</p></div>
  </aside>;

  return <section className="cs-gallery" aria-label={`${project.name} images`}>
    {project.rows.map(r => r.kind === "wide"
      ? [<div key={r.fig.name} className="cs-row cs-row--wide">{fig(r.fig, WIDE)}</div>, note(r.fig)]
      : [<div key={r.figs[0].name} className="cs-row cs-row--pair"
        style={r.ratio ? { "--pair-ratio": r.ratio } as React.CSSProperties : undefined}>{r.figs.map(f => fig(f, HALF))}</div>, ...r.figs.map(note)])}
  </section>;
}
