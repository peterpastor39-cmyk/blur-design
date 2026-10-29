// Small copies of the hero images for the intro loader and the wheel cards, which never
// show them wider than ~300px. Loading the 2000px originals there held up the first paint.
//   node scripts/hero-thumbs.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const names = ["tendr", "billboard", "sonar-mark", "business-cards", "knox-locker", "sonar-mobile", "sonar-dashboard"];
const WIDTH = 720, QUALITY = 70;

const out = "public/hero-images/thumb";
await mkdir(out, { recursive: true });
for (const name of names) {
  const info = await sharp(path.join("public/hero-images", `${name}.webp`)).resize({ width: WIDTH }).webp({ quality: QUALITY }).toFile(path.join(out, `${name}.webp`));
  console.log(`${name}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`);
}
