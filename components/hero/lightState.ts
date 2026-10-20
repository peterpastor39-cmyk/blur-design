export type LightState = {
  /** Light position in viewport UV space (0–1, y up). */
  x: number;
  y: number;
  /** 0 = scene fully dark, 1 = fully lit. */
  intensity: number;
  /** Multiplier for the fabric animation speed (0 freezes it). */
  speed: number;
};
