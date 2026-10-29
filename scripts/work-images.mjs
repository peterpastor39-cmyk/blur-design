// Builds the case-study images in public/work/<slug>/ from full-size source files.
//   node scripts/work-images.mjs "<source folder>" [name,name]   (names: rebuild only those figures)
// Each figure gets AVIF at two widths (served via srcset) and one WebP fallback.
// Crops are fractions of the source: [left, top, width, height].
// `sharp: true` is for screens with small UI text: lighter compression and full-resolution colour.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2] ?? path.join(process.env.USERPROFILE ?? "", "OneDrive/Desktop/hero images");
const WIDTHS = [1000, 2000], FALLBACK = 1600, AVIF_Q = 50, WEBP_Q = 72;

const figures = {
  sonar: [
    { name: "display", file: "Studio Display Screen Mockup_18.jpg" },
    { name: "mark", file: "1.jpg" },
    { name: "mobile", file: "Sonar overview - phone.jpg" },
    { name: "cards", file: "Strategy Flow.png", sharp: true },
    { name: "swatches", file: "Sonar swatches.png", crop: [0, 0, .897, 1], sharp: true },
    { name: "cards-detail", file: "business card mockup.jpg", crop: [.22, .26, .26, .52] },
    { name: "mobile-dashboard", file: "Frame 2085663282.png", crop: [.765, .38, .233, .62] },
    { name: "landing", file: "landing page mockup.jpg", crop: [.24, 0, .556, 1] },
    { name: "strategies", file: "Sonar dashboard - studio display.jpg" },
    // The same studio display, extended to 3:4 for the pair beside the laptop:
    // wall continued above, desk below, both fading to dark.
    { name: "monitor-tall", file: "Studio Display Screen Mockup_18 - tall.png", sharp: true },
    { name: "tablet", file: "Dasboard tablet.png" },
    { name: "screens", file: "White.png", sharp: true },
    { name: "phone", file: "Phone Mocup 1.png" },
    { name: "landing-wide", file: "landing page mockup.jpg" },
    { name: "type-spec", file: "Typography spec sheet.jpg", sharp: true },
    { name: "colour-map", file: "Colour mapping.jpg", sharp: true },
    { name: "colour-swatches", file: "Colour swatches.jpg", sharp: true },
  ],
  tendr: [
    { name: "cover", file: "tendr-waffle-1920x1080.png" },
    { name: "jar", file: "6.jpg" },
    { name: "bottle", file: "Tendr - Mockup1.jpg", crop: [.3, 0, .4, 1] },
    { name: "stone", file: "tendr-waffle-1920x1080.png", crop: [.55, .15, .3, .75] },
    { name: "bottle-wide", file: "Tendr - Mockup1.jpg" },
  ],
  // Work without its own case study yet: only a card image for "More projects".
  "knox-locker": [{ name: "cover", file: "Knox Locker Logo Breakdown.jpg", crop: [.2, 0, .6, 1] }],
  billboard: [{ name: "cover", file: "Billboard 1.jpg" }],
};

// Pixel sizes of each cropped source, read by content/work.ts for srcset widths and aspect ratios.
const only = process.argv[3]?.split(",");
const manifest = only ? JSON.parse(await readFile("content/work-images.json", "utf8")) : {};
for (const [slug, all] of Object.entries(figures)) {
  const list = only ? all.filter(f => only.includes(f.name)) : all;
  if (!list.length) continue;
  manifest[slug] ??= {};
  const out = path.join("public/work", slug);
  await mkdir(out, { recursive: true });
  for (const fig of list) {
    const input = sharp(path.join(src, fig.file));
    const { width = 0, height = 0 } = await input.metadata();
    const base = fig.crop
      ? input.extract({ left: Math.round(fig.crop[0] * width), top: Math.round(fig.crop[1] * height), width: Math.round(fig.crop[2] * width), height: Math.round(fig.crop[3] * height) })
      : input;
    const buffer = await base.toBuffer();
    const { width: w = 0, height: h = 0 } = await sharp(buffer).metadata();
    for (const target of WIDTHS) {
      await sharp(buffer).resize({ width: Math.min(target, w) }).avif(fig.sharp ? { quality: 72, chromaSubsampling: "4:4:4" } : { quality: AVIF_Q }).toFile(path.join(out, `${fig.name}-${target}.avif`));
    }
    await sharp(buffer).resize({ width: Math.min(FALLBACK, w) }).webp(fig.sharp ? { quality: 90, smartSubsample: true } : { quality: WEBP_Q }).toFile(path.join(out, `${fig.name}.webp`));
    manifest[slug][fig.name] = [w, h];
    console.log(`${slug}/${fig.name}  ${w}x${h}`);
  }
}
await writeFile("content/work-images.json", JSON.stringify(manifest, null, 2) + "\n");
