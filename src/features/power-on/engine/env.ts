export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouch(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

/** cubic in-out, clamped */
export function ease(k: number): number {
  k = clamp(k);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

/** quadratic in-out */
export function ease2(k: number): number {
  k = clamp(k);
  return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
}
