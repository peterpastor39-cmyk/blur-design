import sizes from "./work-images.json";

// Case-study content. Images live in public/work/<slug>/ and are built by scripts/work-images.mjs.
// TODO: every decision below is placeholder copy — replace before shipping.

export type Decision = { title: string; body: string };
export type Figure = {
  name: string; alt: string; caption: string; decision?: Decision;
  /** Pixel size of a looping /work/<slug>/<name>.mp4 (with a <name>.webp poster) shown instead of an image. */
  video?: [number, number];
  /** Keep the image's own aspect ratio instead of the row's fixed crop. */
  native?: boolean;
  /** A 2×2 bento grid shown under this image (after its decision); null cells stay empty until real images exist. */
  bento?: (Figure | null)[];
};
export type Row = { kind: "wide"; fig: Figure } | { kind: "slides"; figs: Figure[]; caption: string; ratio?: string } | { kind: "pair"; figs: [Figure, Figure]; /** Shape of both images instead of the 3 / 4 crop, e.g. "4 / 5". */ ratio?: string };
export type Project = {
  slug: string;
  name: string;
  client: string;
  /** What kind of company the client is, shown in the side panel. */
  industry: string;
  services: string[];
  statement: string;
  /** The first paragraph is always shown; the rest sit behind "Read the story". */
  story: string[];
  /** Lead image above the gallery; on phones it sits full-bleed above the title. */
  cover?: { name: string; alt: string };
  /** Image used for this project's card in "More projects" (shown tall, 3:4). */
  card: string;
  rows: Row[];
};

export const projects: Project[] = [
  {
    slug: "sonar",
    name: "Sonar",
    client: "Sonar",
    industry: "Web3 trading platform",
    services: ["Product Design", "Brand Identity", "Mobile App"],
    statement: "A trading platform where dense on-chain data reads as calm, clear decisions.",
    story: [
      "Sonar lets traders run automated strategies across several chains at once. The data was all there — balances, volumes, open positions — but it arrived as noise, and every screen asked for attention at the same volume.",
      "We started from the name: a sonar doesn’t show you everything, it shows you what’s moving. The identity borrows that idea, with a mark built from pulses and a palette that stays near-black so a single green can mean “act”.",
      "The product follows the same rule. One accent, one primary action per screen, and numbers set large enough to read at a glance on a phone between meetings.",
    ],
    card: "mobile",
    rows: [
      { kind: "slides", caption: "Sonar across devices — one accent colour across the whole product", figs: [
        { name: "display", alt: "Sonar dashboard on a studio display", caption: "Studio display",
          decision: { title: "One colour means “act”", body: "Everything sits in greys so the green is reserved for actions and gains. When it appears, it is always the thing to look at." } },
        { name: "tablet", alt: "Sonar token page on a tablet", caption: "Tablet" },
        { name: "phone", alt: "Sonar app on a phone", caption: "Phone" },
        { name: "landing-wide", alt: "Sonar landing page on a laptop", caption: "Landing page" },
      ] },
      { kind: "pair", ratio: "4 / 5", figs: [
        { name: "swap", alt: "Sonar mobile swap: picking SOL, typing an amount, swapping into USDC and watching it complete", caption: "Mobile — swap", video: [880, 1100] },
        { name: "mobile", alt: "Sonar mobile app showing active strategies", caption: "Mobile — active strategies" },
      ] },
      { kind: "wide", fig: { name: "cards", native: true, alt: "Sonar strategy creation flow across screens", caption: "Product — strategy flow",
        decision: { title: "The pulse carries into print", body: "The concentric pattern on the card backs is the mark’s pulse, repeated. It lets small pieces of print feel like Sonar without the logo shouting." } } },
      { kind: "pair", figs: [
        { name: "monitor-tall", alt: "Sonar dashboard with active strategies and token table on a studio display", caption: "Dashboard — strategies and tokens" },
        { name: "landing", alt: "Sonar landing page, “Automated DeFi Strategies”, on a laptop", caption: "Web — landing page" },
      ] },
      { kind: "wide", fig: { name: "tablet", alt: "Sonar token page for BONK / SOL with price chart, swap panel and transactions on a tablet", caption: "Token page on tablet" } },
      { kind: "wide", fig: { name: "screens", alt: "Five Sonar screens: dashboard, token page, strategies, rewards and batch deposit", caption: "Product screens", native: true,
        bento: [{ name: "type-spec", alt: "Sonar heading scale h1 to h6 in regular and medium, with tokens and sizes", caption: "Typography — heading scale" },
          { name: "type-glyphs", alt: "Character set of lowercase letters, numerals and symbols, cycling through Inter Tight and Inter Display in regular, medium and semibold", caption: "Typography — character set", video: [1400, 904] },
          { name: "colour-map", alt: "Sonar Green, Sonar Blue and Card Surface mapped to the tokens and components that use them", caption: "Colour — tokens in use" },
          { name: "colour-swatches", alt: "Sonar Green, Sonar Black and three neutrals with HEX, RGB, CMYK and token names", caption: "Colour — palette" }],
        decision: { title: "Big numbers, quiet tables", body: "Totals are set large and everything beneath them is set small and even. Traders scan the headline first and only drop into the table when something has moved." } } },
    ],
  },
  {
    slug: "tendr",
    name: "Tendr",
    client: "Tendr",
    industry: "Skincare brand",
    services: ["Packaging", "Brand Identity"],
    statement: "Skincare packaging shaped by raw stone and warm light.",
    story: [
      "Tendr makes a small range of plant-based skincare. The packaging had to sit on a shelf next to brands with ten times the budget and still feel considered.",
      "We kept the forms simple and let material do the work: warm terracotta, natural stone and bamboo, photographed in low, late light.",
    ],
    cover: { name: "cover", alt: "Tendr product range arranged on raw stone" },
    card: "stone",
    rows: [
      { kind: "wide", fig: { name: "jar", alt: "Tendr jar with a bamboo lid", caption: "Jar with bamboo lid",
        decision: { title: "Material over decoration", body: "No patterns, no gradients. The bamboo lid and frosted glass carry the brand, so the label can stay small." } } },
      { kind: "pair", figs: [
        { name: "bottle", alt: "Terracotta Tendr bottle", caption: "Cleanser bottle" },
        { name: "stone", alt: "Tendr bottles on stone, detail", caption: "Range on stone, detail" },
      ] },
      { kind: "wide", fig: { name: "bottle-wide", alt: "Tendr bottle in warm light", caption: "Campaign still" } },
    ],
  },
];

export function imageSize(slug: string, name: string): [number, number] {
  const set = (sizes as Record<string, Record<string, number[]>>)[slug];
  const [w, h] = set?.[name] ?? [3, 2];
  return [w, h];
}

// Homepage work without a case study yet. Their cards link back to the work grid.
const otherWork = [
  { slug: "knox-locker", name: "Knox Locker", line: "Logo", card: "cover" },
  { slug: "billboard", name: "Billboard", line: "Identity", card: "cover" },
];

export type MoreCard = { slug: string; name: string; line: string; card: string; href: string };

export function getProject(slug: string) {
  const i = projects.findIndex(p => p.slug === slug);
  if (i < 0) return null;
  // Three cards: the following case studies first (wrapping round), then other work to fill.
  const after = [...projects.slice(i + 1), ...projects.slice(0, i)];
  const more: MoreCard[] = [
    ...after.map(p => ({ slug: p.slug, name: p.name, line: p.services[0], card: p.card, href: `/work/${p.slug}` })),
    ...otherWork.map(w => ({ ...w, href: "/#work" })),
  ].slice(0, 3);
  return { project: projects[i], more };
}
