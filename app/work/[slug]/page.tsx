import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudy from "@/components/work/CaseStudy";
import { getProject, projects } from "@/content/work";

// Static export: every case study is prerendered; unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const found = getProject((await params).slug);
  if (!found) return {};
  return { title: `${found.project.name} — Blur`, description: found.project.statement };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const found = getProject((await params).slug);
  if (!found) notFound();
  return <CaseStudy project={found.project} more={found.more} />;
}
