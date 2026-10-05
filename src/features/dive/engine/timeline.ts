import { clamp, lerp } from "./math";

/**
 * The dive is one timeline `p` in 0..1. Page scroll (in screens) is remapped onto it with "holds":
 * around each beat the timeline barely moves, so captions, code layers and era panels stay readable
 * for a comfortable scroll distance. Everything here is pure and computed once at module load.
 */

/** Landmarks on the timeline (p). */
export const T = {
  hook1: 0.03,
  hook2: 0.09,
  aim: 0.13,
  zoomA: 0.15,
  zoomB: 0.24,
  layA: 0.22,
  layB: 0.56,
  wireA: 0.52,
  wireB: 0.62,
  tunA: 0.58,
  tunB: 0.92,
  deskA: 0.9,
} as const;

export type CaptionKey = "hook1" | "hook2" | "zoom" | "jsx" | "js" | "html" | "css" | "http" | "wire";

/** [from, to, message key] — null means no caption. */
export const CAPTIONS: ReadonlyArray<readonly [number, number, CaptionKey | null]> = [
  [0, 0.03, null],
  [0.03, 0.09, "hook1"],
  [0.09, 0.15, "hook2"],
  [0.15, 0.22, "zoom"],
  [0.22, 0.284, "jsx"],
  [0.284, 0.345, "js"],
  [0.345, 0.405, "html"],
  [0.405, 0.466, "css"],
  [0.466, 0.53, "http"],
  [0.53, 0.62, "wire"],
  [0.62, 0.9, null],
  [0.9, 1.01, null],
];

export function captionAt(p: number): CaptionKey | null {
  for (const [a, b, key] of CAPTIONS) if (p >= a && p < b) return key;
  return null;
}

/** hook ×2, zoom, 5 code layers, wire, 5 tunnel eras, desk */
const HOLDS = [0.06, 0.12, 0.2, 0.253, 0.314, 0.375, 0.436, 0.496, 0.57, 0.614, 0.676, 0.737, 0.799, 0.861, 1];
const HOLD_W = 0.75; // screens per hold
const HOLD_HALF = 0.007; // half-width of a hold, in p
const TRAVEL = 7.5; // screens per unit of p between holds

interface Segment {
  s: number; // start, in screens
  len: number; // length, in screens
  p0: number;
  p1: number;
  hold?: number;
}

function build() {
  const segs: Segment[] = [];
  let total = 0;
  let p = 0;
  for (const h of HOLDS) {
    const a = h === 1 ? 1 : h - HOLD_HALF;
    const b = h === 1 ? 1 : h + HOLD_HALF;
    segs.push({ s: total, len: (a - p) * TRAVEL, p0: p, p1: a });
    total += (a - p) * TRAVEL;
    const hl = h === 1 ? 0.6 : HOLD_W;
    segs.push({ s: total, len: hl, p0: a, p1: b, hold: h });
    total += hl;
    p = b;
  }
  const holdAt = segs.filter((g) => g.hold !== undefined).map((g) => g.s + g.len / 2);
  holdAt[holdAt.length - 1] = total;
  return { segs, total, holdAt };
}

const built = build();
/** Track length, in screens (the track is TOTAL + 1 viewport heights tall). */
export const TOTAL = built.total;
/** Centre of each beat, in screens. The last one is the very end (the desk). */
export const HOLD_AT: readonly number[] = built.holdAt;

/** Screens scrolled → timeline p. */
export function toP(screens: number): number {
  for (const g of built.segs) {
    if (screens <= g.s + g.len) return lerp(g.p0, g.p1, g.len ? clamp((screens - g.s) / g.len, 0, 1) : 1);
  }
  return 1;
}
