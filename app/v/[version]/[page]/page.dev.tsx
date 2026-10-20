import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { components } from "@/variants/manifest";
import registry from "@/variants/registry.json";

type Props = {
  params: Promise<{ version: string; page: string }>;
};

// Browser tab name when a page is opened on its own: the same version and
// page names the preview uses, e.g. "App V2 · Dashboard".
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version, page } = await params;
  const v = registry.versions.find((x) => x.id === version)?.label ?? version;
  const p = (registry.pages as Record<string, { label: string }>)[page]?.label ?? page;
  return { title: `${v} · ${p}` };
}

// Renders one page of one design version, full-page. The preview iframes
// point here.
export default async function VersionPage({ params }: Props) {
  const { version, page } = await params;
  const Component = components[`${version}/${page}`];
  if (!Component) notFound();
  return <Component />;
}
