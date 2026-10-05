import { lerp } from "./math";

/** Geometry of the CSS-3D time tunnel (scene 3). */
export const DEPTH = 9000; // total tunnel length, px
export const RINGS = 26;
export const RING_R = 520;

export const ERA_YEARS = [2016, 2010, 2006, 1997, 1991] as const;
export type EraYear = (typeof ERA_YEARS)[number];

export function ringStyle(i: number) {
  const z = -i * (DEPTH / RINGS);
  const hue = lerp(220, 35, i / RINGS);
  return {
    width: RING_R * 2,
    height: RING_R * 2,
    borderColor: `hsla(${hue},80%,70%,.35)`,
    boxShadow: `0 0 30px hsla(${hue},80%,60%,.18), inset 0 0 30px hsla(${hue},80%,60%,.12)`,
    transform: `translate3d(-50%,-50%,${z}px)`,
  };
}

export const ringZ = (i: number) => -i * (DEPTH / RINGS);
export const panelZ = (k: number) => -(k + 0.7) * (DEPTH / (ERA_YEARS.length + 0.4));
/** Era panels alternate sides; this is how far they sit from the axis. */
export const sideOffset = (viewportWidth: number) => (viewportWidth < 600 ? 230 : 330);

/** Year counter keyframes: [tunnel progress, year], 2026 → each era → 1989. */
export const YEAR_KEYS: ReadonlyArray<readonly [number, number]> = [
  [0, 2026],
  ...ERA_YEARS.map((y, k) => [(-panelZ(k) - 250) / (DEPTH * 1.02), y] as const),
  [1, 1989],
];

export function yearAt(tp: number): number {
  for (let i = 1; i < YEAR_KEYS.length; i++) {
    const [p1, y1] = YEAR_KEYS[i];
    const [p0, y0] = YEAR_KEYS[i - 1];
    if (tp <= p1) return Math.round(lerp(y0, y1, (tp - p0) / (p1 - p0)));
  }
  return 1989;
}
