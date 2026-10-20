export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAspect;      // viewport width / height
  uniform float uPixel;       // one screen pixel in world units
  uniform vec2  uLight;       // light position, viewport UV (0–1)
  uniform float uIntensity;   // 0 = dark, 1 = lit
  uniform sampler2D uLogo;    // R rim, G bevel, B drape
  uniform float uTexAspect;   // logo texture width / height
  uniform float uTexScale;    // texture height / logo height

  varying vec2 vUv;

  // ---- Tunables -------------------------------------------------------
  const vec2  LOGO_CENTER  = vec2(0.0, 0.1);   // world units, y up
  const float LOGO_HEIGHT  = 0.6;              // fraction of viewport height
  const float FOLD_AMP     = 0.1;
  const float FOLD_SCALE   = 2.1;
  const float RIM_DEPTH    = 0.035;
  const float BEVEL_DEPTH  = 0.09;
  const float DRAPE_DEPTH  = 0.06;
  const float CONTOUR_FREQ = 170.0;
  const float CONTOUR_AMP  = 0.0028;
  const float LIGHT_Z      = 0.3;
  const float FALLOFF      = 5.5;
  const vec3  TINT_HI      = vec3(0.86, 0.86, 1.0);
  const vec3  TINT_LO      = vec3(0.40, 0.38, 0.62);
  // ---------------------------------------------------------------------

  vec2 logoUv(vec2 p) {
    // Keep the letter inside narrow (portrait) viewports.
    float lh = min(LOGO_HEIGHT, uAspect * 0.62);
    float th = lh * uTexScale;
    return (p - LOGO_CENTER) / vec2(th * uTexAspect, th) + 0.5;
  }

  // Layered, domain-warped sines read as slow satin folds.
  float folds(vec2 p, float t) {
    vec2 q = p * FOLD_SCALE;
    float f = sin(q.x * 1.7 + t * 0.35 + sin(q.y * 2.3 - t * 0.25) * 1.2);
    f += 0.6  * sin(q.y * 2.9 - t * 0.30 + sin(q.x * 1.9 + t * 0.20) * 1.4);
    f += 0.35 * sin((q.x + q.y) * 3.7 + t * 0.45 + sin(q.x * 3.1 - t * 0.1) * 0.8);
    return f * 0.5;
  }

  float heightAt(vec2 p) {
    vec3 logo = texture2D(uLogo, logoUv(p)).rgb;
    float fabric = folds(p, uTime) * FOLD_AMP;
    // Fabric flattens and lifts where it drapes over the letter.
    float h = fabric * (1.0 - 0.75 * logo.b) + logo.b * DRAPE_DEPTH;
    h += logo.g * BEVEL_DEPTH + logo.r * RIM_DEPTH;
    // Fine ridges that show up as contour lines in the highlights.
    h += CONTOUR_AMP * sin(h * CONTOUR_FREQ);
    return h;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);

    float e = uPixel * 1.5;
    float h  = heightAt(p);
    float hx = heightAt(p + vec2(e, 0.0));
    float hy = heightAt(p + vec2(0.0, e));
    vec3 n = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));

    vec2 lp = (uLight - 0.5) * vec2(uAspect, 1.0);
    vec3 P = vec3(p, h);
    vec3 Ld = normalize(vec3(lp, LIGHT_Z) - P);
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(Ld + V);

    vec2 dl = lp - p;
    float att = exp(-dot(dl, dl) * FALLOFF) * uIntensity;

    float ndh = max(dot(n, H), 0.0);
    float spec  = pow(ndh, 90.0);
    float sheen = pow(ndh, 14.0);
    float diff  = max(dot(n, Ld), 0.0);

    // The flat face of the letter stays glossy-black; rims and folds catch light.
    vec3 logo = texture2D(uLogo, logoUv(p)).rgb;
    float face = smoothstep(0.9, 1.0, logo.g);
    spec  *= 1.0 - 0.6 * face;
    sheen *= 1.0 - 0.8 * face;

    // Steep edges facing the light catch a chrome rim; edges facing away stay dark.
    float fres = pow(1.0 - n.z, 2.0);
    float rim = fres * pow(diff, 3.0);

    vec3 col = TINT_HI * (spec * 1.6 + sheen * 0.45 + rim * 1.4)
             + TINT_LO * (diff * 0.05 + fres * 0.12);
    col *= att;

    col = 1.0 - exp(-col * 1.25);                  // soft tone map
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0; // dither vs banding
    gl_FragColor = vec4(col, 1.0);
  }
`;
