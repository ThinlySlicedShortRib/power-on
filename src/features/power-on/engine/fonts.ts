// Canvas text can't use CSS variables, so resolve the next/font families at runtime.
// Each stack ends with the CJK fallbacks so translated canvas labels still render.
export type FontKey = "term" | "comic" | "sans" | "serif" | "hand" | "pixel" | "flat" | "mono";

const VARS: Record<FontKey, [string, string]> = {
  term: ["--font-vt323", "'Courier New', monospace"],
  comic: ["--font-comic", "'Comic Sans MS', cursive"],
  sans: ["--font-geist", "system-ui, sans-serif"],
  serif: ["--font-instrument-serif", "Georgia, serif"],
  hand: ["--font-caveat", "'Marker Felt', cursive"],
  pixel: ["--font-press-start", "monospace"],
  flat: ["--font-open-sans", "Arial, sans-serif"],
  mono: ["--font-geist-mono", "monospace"],
};

export type FontStacks = Record<FontKey, string> & { aqua: string };

export function resolveFonts(): FontStacks {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  const cjk = [v("--font-cjk-tc"), v("--font-cjk-sc")].filter(Boolean);
  if (document.documentElement.dataset.script === "zh-Hans") cjk.reverse();
  const out = {} as FontStacks;
  for (const [k, [name, generic]] of Object.entries(VARS) as [FontKey, [string, string]][]) {
    out[k] = [v(name), ...cjk, generic].filter(Boolean).join(", ");
  }
  out.aqua = ["'Lucida Grande'", "Verdana", ...cjk, "sans-serif"].join(", ");
  return out;
}

/** Ask the browser to fetch the canvas faces (they are not preloaded), then resolve. */
export async function loadCanvasFonts(fonts: FontStacks): Promise<void> {
  if (!document.fonts) return;
  const probes = [`28px ${fonts.term}`, `bold 20px ${fonts.comic}`, `600 30px ${fonts.hand}`, `16px ${fonts.pixel}`, `600 20px ${fonts.flat}`, `300 34px ${fonts.flat}`,
    `600 44px ${fonts.sans}`, `italic 40px ${fonts.serif}`];
  try {
    await Promise.all(probes.map((p) => document.fonts.load(p, "Aa1").catch(() => [])));
    await document.fonts.ready;
  } catch {
    /* fonts are cosmetic */
  }
}
