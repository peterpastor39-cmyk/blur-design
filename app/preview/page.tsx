import registry from "@/variants/registry.json";
import styles from "./preview.module.css";

export const metadata = { title: "Blur — Hero versions" };

export default async function Preview({ searchParams }: { searchParams: Promise<{ version?: string }> }) {
  const { version } = await searchParams;
  const versions = registry.versions.filter(v => !("draft" in v && v.draft));
  const current = versions.find(v => v.id === version) || versions[versions.length - 1];
  return <main className={styles.preview}>
    <header className={styles.bar}>
      <span>Blur · Hero versions</span>
      <nav aria-label="Saved hero versions">{versions.map(v=><a key={v.id} href={`/preview?version=${v.id}`} aria-current={v.id === current.id ? "page" : undefined}>{v.label}</a>)}</nav>
      <a href={`/v/${current.id}/home`} target="_blank" rel="noreferrer">Open full page ↗</a>
    </header>
    <iframe title={current.label} src={`/v/${current.id}/home`} className={styles.frame} />
  </main>;
}
