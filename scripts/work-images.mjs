// Builds the case-study images in public/work/<slug>/ from full-size source files.
//   node scripts/work-images.mjs "<source folder>"
// Each figure gets AVIF at two widths (served via srcset) and one WebP fallback.
// Crops are fractions of the source: [left, top, width, height].
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2] ?? path.join(process.env.USERPROFILE ?? "", "OneDrive/Desktop/hero images");
const WIDTHS = [1000, 2000], FALLBACK = 1600, AVIF_Q = 50, WEBP_Q = 72;

const figures = {
  sonar: [
    { name: "cover", file: "Frame 2085663282.png" },
    { name: "volume", file: "Frame 2085663282.png", crop: [.53, .1, .3, .4] },
    { name: "mark", file: "1.jpg" },
    { name: "mobile", file: "phone mockup 3.jpg" },
    { name: "cards", file: "business card mockup.jpg" },
    { name: "cards-detail", file: "business card mockup.jpg", crop: [.22, .26, .26, .52] },
    { name: "mobile-dashboard", file: "Frame 2085663282.png", crop: [.765, .38, .233, .62] },
    { name: "strategies", file: "Frame 2085663282.png", crop: [.26, .4, .4, .53] },
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
const manifest = {};
for (const [slug, list] of Object.entries(figures)) {
  manifest[slug] = {};
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
      await sharp(buffer).resize({ width: Math.min(target, w) }).avif({ quality: AVIF_Q }).toFile(path.join(out, `${fig.name}-${target}.avif`));
    }
    await sharp(buffer).resize({ width: Math.min(FALLBACK, w) }).webp({ quality: WEBP_Q }).toFile(path.join(out, `${fig.name}.webp`));
    manifest[slug][fig.name] = [w, h];
    console.log(`${slug}/${fig.name}  ${w}x${h}`);
  }
}
await writeFile("content/work-images.json", JSON.stringify(manifest, null, 2) + "\n");
