import { loadJSON, save } from "@/features/power-on/engine/storage";

/**
 * The reader's like: the thread through the whole flow. The dive copies it from murmur (the like button it opens),
 * Power On pays it off at the end (the count lands +1). Kept in sessionStorage too, so a locale switch keeps it.
 */
export interface LikeCarry {
  /** murmur post id ("p1" = Mika's launch post) */
  id: string;
  /** the count as the reader last saw it */
  likes: number;
  liked: boolean;
  theme: "light" | "dark";
}

/** "Show me" without a like: Mika's launch post, as it opens. */
export const DEFAULT_LIKE: LikeCarry = { id: "p1", likes: 1284, liked: false, theme: "light" };

const KEY = "poweron.like";

export function loadLike(): LikeCarry | null {
  const v = loadJSON<Partial<LikeCarry> | null>(KEY, null, "session");
  if (!v || typeof v.id !== "string" || typeof v.likes !== "number" || !Number.isFinite(v.likes)) return null;
  return { id: v.id, likes: Math.max(0, Math.round(v.likes)), liked: v.liked === true, theme: v.theme === "dark" ? "dark" : "light" };
}

export function saveLike(like: LikeCarry): void {
  save(KEY, JSON.stringify(like), "session");
}
