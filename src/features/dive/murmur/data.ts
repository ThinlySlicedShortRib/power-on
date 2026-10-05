/** Static, non-text data for murmur. All user-visible text lives in messages/<locale>/dive.json. */

export const USER_KEYS = ["ana", "mika", "jo", "sam", "lee", "ravi"] as const;
export type UserKey = (typeof USER_KEYS)[number];
export type AuthorKey = UserKey | "me";

export const CHAT_KEYS = ["ana", "mika", "jo"] as const;
export type ChatKey = (typeof CHAT_KEYS)[number];

export const TABS = ["home", "explore", "notifs", "messages", "profile"] as const;
export type Tab = (typeof TABS)[number];

export const USER_COLORS: Record<UserKey, string> = {
  ana: "#0ca678",
  mika: "#ff7a59",
  jo: "#4b5bff",
  sam: "#e64980",
  lee: "#f08c00",
  ravi: "#7048e8",
};

/** Story slide backgrounds; slide text is content.stories[user][i]. */
export const STORY_BG: Record<UserKey, string[]> = {
  ana: ["linear-gradient(160deg,#0ca678,#0b7285)", "linear-gradient(160deg,#20c997,#4dabf7)"],
  mika: ["linear-gradient(160deg,#ff7a59,#ff3d6e)", "linear-gradient(160deg,#ffb341,#ff7a59)"],
  jo: ["linear-gradient(160deg,#4b5bff,#15aabf)"],
  sam: ["linear-gradient(160deg,#e64980,#7048e8)", "linear-gradient(160deg,#7048e8,#1c1f2a)"],
  lee: ["linear-gradient(160deg,#f59f00,#e8590c)"],
  ravi: ["linear-gradient(160deg,#7048e8,#4b5bff)"],
};

export const EMOJI = ["😀", "😂", "🤯", "🔥", "❤️", "🎉", "👀", "🚀", "☕", "💯", "🫠", "👍", "🙌", "😎", "🤔", "✨"];

/** Authors of content.pool[i], in order. */
export const POOL_AUTHORS: UserKey[] = ["jo", "sam", "lee", "ana", "ravi", "mika", "sam", "lee", "ana", "ravi", "mika", "jo"];

export const TAG_BASE: Record<string, number> = {
  ViewSource: 12402,
  WebHistory: 8115,
  DialUpSounds: 3021,
  JavaScript: 21480,
  ShipIt: 5410,
  WebPerf: 4203,
  CSS: 9876,
  React: 15102,
  TinyWebsites: 2604,
  Web20: 911,
};

export const WHO_TO_FOLLOW: UserKey[] = ["lee", "ravi", "sam"];
export const SWATCHES = ["#141822", "#ff3d6e", "#4b5bff", "#0ca678", "#f08c00", "#7048e8"];

export const ME_HANDLE = "you";
export const ME_COLOR = "#141822";
