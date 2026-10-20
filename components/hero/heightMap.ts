import * as THREE from "three";

// The logo is drawn LOGO_H px tall inside a TEX_H px texture, leaving padding
// so the widest blur (the "drape" halo) is not clipped at the edges.
export const LOGO_H = 760;
export const TEX_H = 1040;

/** Separable box blur along one axis using prefix sums. */
function blur1D(src: Float32Array, w: number, h: number, r: number, horizontal: boolean) {
  const out = new Float32Array(src.length);
  const n = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const stride = horizontal ? 1 : w;
  const prefix = new Float32Array(n + 1);

  for (let l = 0; l < lines; l++) {
    const base = horizontal ? l * w : l;
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + src[base + i * stride];
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - r);
      const b = Math.min(n - 1, i + r);
      out[base + i * stride] = (prefix[b + 1] - prefix[a]) / (b - a + 1);
    }
  }
  return out;
}

/** Three box-blur passes ≈ a gaussian of the given sigma. */
function gaussian(src: Float32Array, w: number, h: number, sigma: number) {
  const r = Math.max(1, Math.round(Math.sqrt((12 * sigma * sigma) / 3 + 1) / 2));
  let out = src;
  for (let k = 0; k < 3; k++) {
    out = blur1D(out, w, h, r, true);
    out = blur1D(out, w, h, r, false);
  }
  return out;
}

/**
 * Rasterises the logo SVG and packs three blurred versions of its silhouette
 * into one half-float texture:
 *   R = tight blur  → sharp chrome rim
 *   G = medium blur → rounded bevel / face
 *   B = wide blur   → the fabric draping up around the letter
 */
export async function buildHeightMap(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();

  const pad = (TEX_H - LOGO_H) / 2;
  const logoW = Math.round((img.naturalWidth / img.naturalHeight) * LOGO_H);
  const w = logoW + pad * 2;
  const h = TEX_H;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, pad, pad, logoW, LOGO_H);
  const pixels = ctx.getImageData(0, 0, w, h).data;

  const mask = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) mask[i] = pixels[i * 4 + 3] / 255;

  const rim = gaussian(mask, w, h, 2.5);
  const bevel = gaussian(mask, w, h, 9);
  const drape = gaussian(mask, w, h, 38);

  const data = new Uint16Array(w * h * 4);
  const toHalf = THREE.DataUtils.toHalfFloat;
  for (let y = 0; y < h; y++) {
    // DataTexture rows start at the bottom; canvas rows start at the top.
    const dstRow = (h - 1 - y) * w;
    for (let x = 0; x < w; x++) {
      const s = y * w + x;
      const d = (dstRow + x) * 4;
      data[d] = toHalf(rim[s]);
      data[d + 1] = toHalf(bevel[s]);
      data[d + 2] = toHalf(drape[s]);
      data[d + 3] = toHalf(1);
    }
  }

  const texture = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.HalfFloatType);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return { texture, aspect: w / h };
}
