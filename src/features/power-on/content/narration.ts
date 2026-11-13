// Video narration: "Sean in a bubble" (docs/video-narration-plan.md). Seven clips, one for the opening shot and one
// per era title card. A clip plays only if it is listed in AVAILABLE; anything else is skipped silently.
import type { AppLocale } from "@/i18n/routing";

export const CLIP_IDS = ["intro-open", "e1-title", "e2-title", "e3-title", "e4-title", "e5-title", "e6-title"] as const;
export type ClipId = (typeof CLIP_IDS)[number];

/** What's on disk for a clip, under public/narration/ (see section 7 of the plan). */
interface ClipFiles {
  /** <id>.webm (VP9/Opus) next to the mp4; the browser picks whichever it plays first */
  webm?: boolean;
  /** <id>.webp or <id>.jpg: the home-pose first frame, shown while the clip buffers */
  poster?: "webp" | "jpg";
  /** locales with captions/<locale>/<id>.vtt */
  captions?: readonly AppLocale[];
}

/**
 * The clips that exist. <id>.mp4 (H.264/AAC) is always required. To enable an era clip, drop its files into
 * public/narration/ and add one line, e.g.  "e1-title": { webm: true, poster: "webp", captions: ["en", "es"] },
 */
const AVAILABLE: Partial<Record<ClipId, ClipFiles>> = {
  "intro-open": { webm: true, poster: "webp" },
};

export interface Clip {
  id: ClipId;
  sources: { src: string; type: string }[];
  poster?: string;
  captions: Partial<Record<AppLocale, string>>;
}

const BASE = "/narration";

export function clipFor(id: ClipId): Clip | null {
  const f = AVAILABLE[id];
  if (!f) return null;
  const sources = [{ src: `${BASE}/${id}.mp4`, type: "video/mp4" }];
  if (f.webm) sources.unshift({ src: `${BASE}/${id}.webm`, type: "video/webm" });
  const captions: Clip["captions"] = {};
  f.captions?.forEach((l) => { captions[l] = `${BASE}/captions/${l}/${id}.vtt`; });
  return { id, sources, poster: f.poster && `${BASE}/${id}.${f.poster}`, captions };
}

/** era index (0–5) → its title-card clip */
export const eraClip = (era: number): ClipId => `e${era + 1}-title` as ClipId;

/**
 * The clip for where the reader is (what "Replay narrator" plays): the opening's on the opening shot and the desk, the
 * era's anywhere in that era. Null while booting, or when that clip isn't available.
 */
export function clipHere(mode: "intro" | "booting" | "story", era: number): Clip | null {
  return mode === "intro" ? clipFor("intro-open") : mode === "story" ? clipFor(eraClip(era)) : null;
}

/**
 * How the bubble trails the cursor while a clip plays (desktop only), themed on each era's network (plan M4).
 * Exponential follow with time constant `tau` (s); `fps` only moves it in steps at that rate; `lead` aims ahead along
 * the pointer's velocity (s); `slowTau`+`warm` start at slowTau and tighten to tau over `warm` s of continuous movement.
 */
export interface Feel { tau: number; fps?: number; lead?: number; slowTau?: number; warm?: number }
export const FEEL: Record<"e1" | "e2" | "e3" | "e4" | "e5" | "e6", Feel> = {
  e1: { tau: 0.5 }, // leased line: ~0.5 s behind
  e2: { tau: 0, fps: 4 }, // dial-up: arrives in steps, 4 a second
  e3: { tau: 0.14 }, // smooth
  e4: { tau: 0.05, slowTau: 0.6, warm: 0.45 }, // slow to start, fast once running
  e5: { tau: 0 }, // edge: instant
  e6: { tau: 0.07, lead: 0.12 }, // the agent predicts where you're going
};
/** the opening uses the 1989 feel */
export const feelFor = (id: ClipId): Feel => FEEL[id === "intro-open" ? "e1" : (id.slice(0, 2) as keyof typeof FEEL)];

/** Bubble geometry (px). The cursor offset keeps it down and away from the pointer so it never sits under it. */
export const BUBBLE = { desktop: 150, touch: 112, offset: 40, margin: 12, gap: 10 } as const;
