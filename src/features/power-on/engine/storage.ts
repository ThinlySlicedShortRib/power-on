// Every storage access is wrapped: private windows, blocked site data and previews can throw.
export function load(key: string, area: "local" | "session" = "local"): string | null {
  try {
    return (area === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

export function save(key: string, value: string | null, area: "local" | "session" = "local"): void {
  try {
    const s = area === "local" ? window.localStorage : window.sessionStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function loadJSON<T>(key: string, fallback: T, area: "local" | "session" = "local"): T {
  const raw = load(key, area);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const KEYS = {
  sound: "poweron.sound",
  music: "poweron.music",
  mvol: "poweron.mvol",
  adv: "poweron.adv",
  visits: "poweron.visits",
  guestbook: "poweron.guestbook",
  predict: "poweron.predict",
  resume: "poweron.resume",
} as const;

/** A reader's position, saved right before a locale switch so the story can pick up where it was. */
export interface ResumePoint { era: number; beat: number; at: number }

export function saveResume(p: { era: number; beat: number }): void {
  save(KEYS.resume, JSON.stringify({ ...p, at: Date.now() }), "session");
}

export function peekResume(): ResumePoint | null {
  const r = loadJSON<ResumePoint | null>(KEYS.resume, null, "session");
  if (!r || typeof r.era !== "number" || typeof r.beat !== "number" || Date.now() - r.at > 30000) return null;
  return r;
}

export function consumeResume(): ResumePoint | null {
  const r = peekResume();
  save(KEYS.resume, null, "session");
  return r;
}
