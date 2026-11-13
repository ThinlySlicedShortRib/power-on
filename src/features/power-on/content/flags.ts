// Feature flags. One for now: the video narrator (Narrator.tsx, content/narration.ts).
import { useSyncExternalStore } from "react";

const truthy = (v: string | undefined) => v === "1" || v === "true";

/**
 * The narrator's build-time default: NEXT_PUBLIC_FEATURE_NARRATOR="1" or "true" turns him on, anything else (or unset)
 * leaves him off. Inlined by `next build`, so changing it needs a rebuild/redeploy.
 */
export const narratorEnabled: boolean = truthy(process.env.NEXT_PUBLIC_FEATURE_NARRATOR);

/** sessionStorage key for the `?narrator=1` preview override (survives the language switch's navigation in this tab) */
const OVERRIDE_KEY = "poweron.flag.narrator";

let resolved: boolean | null = null;

/**
 * Client only. `?narrator=1` turns the narrator on for this visit (kept in sessionStorage), `?narrator=0` clears that
 * override (back to the build default). Worked out once per page load.
 */
function resolveNarrator(): boolean {
  if (resolved !== null) return resolved;
  let on = narratorEnabled;
  try {
    const q = new URLSearchParams(window.location.search).get("narrator");
    if (q === "1" || q === "true") window.sessionStorage.setItem(OVERRIDE_KEY, "1");
    else if (q === "0" || q === "false") window.sessionStorage.removeItem(OVERRIDE_KEY);
    if (window.sessionStorage.getItem(OVERRIDE_KEY) === "1") on = true;
  } catch {
    /* storage blocked: the build default stands */
  }
  resolved = on;
  return on;
}

const noSubscribe = () => () => {};

/**
 * Whether the narrator is on for this visit: the build default plus the URL/session override. Hydration-safe: the server
 * (and a hydrating client) render the build default; the override is read on the client only.
 */
export function useNarratorEnabled(): boolean {
  return useSyncExternalStore(noSubscribe, resolveNarrator, () => narratorEnabled);
}
