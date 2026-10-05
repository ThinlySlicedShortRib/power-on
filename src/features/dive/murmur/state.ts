import { CHAT_KEYS, ME_COLOR, STORY_BG, USER_KEYS, type AuthorKey, type ChatKey, type Tab, type UserKey } from "./data";

/* ---------- model ---------- */

/** Text is either user-typed (`text`) or a content key resolved at render time (so it follows the locale). */
export interface Reply {
  u: AuthorKey;
  text?: string;
  /** key into content.seedReplies */
  key?: string;
}

export interface Post {
  id: string;
  u: AuthorKey;
  text?: string;
  /** "posts.p1" | "pool.3" */
  key?: string;
  ts: number;
  likes: number;
  reposts: number;
  /** replies that exist "elsewhere" (only counted) */
  rbase: number;
  pic?: 1 | 2;
  replies: Reply[];
  liked?: boolean;
  rp?: boolean;
  bm?: boolean;
  mine?: boolean;
  /** entrance animation; cleared on tab change */
  anim?: "new" | "pending";
}

export type NotifKind = "likedPost" | "likedReply" | "followedBack" | "repostedLaunch" | "startedFollowing" | "mentioned";
export type NotifIcon = "heart" | "user" | "reply" | "repost";

export interface Notif {
  id: string;
  icon: NotifIcon;
  kind: NotifKind;
  who: UserKey;
  ts: number;
  fresh?: boolean;
}

export interface ChatMsg {
  f: ChatKey | "me";
  text?: string;
  /** [content array, index], e.g. ["chats.ana", 0] or ["botReplies.jo", 2] */
  ref?: readonly [string, number];
}

export interface Me {
  /** null = the localized default ("You") */
  name: string | null;
  color: string;
}

export interface MurmurState {
  tab: Tab;
  theme: "light" | "dark";
  me: Me;
  posts: Post[];
  open: Record<string, boolean>;
  follows: Partial<Record<UserKey, boolean>>;
  followBacks: number;
  seen: Partial<Record<UserKey, boolean>>;
  pending: Post[];
  loading: boolean;
  caughtUp: boolean;
  notifs: Notif[];
  unread: number;
  chats: Record<ChatKey, ChatMsg[]>;
  chatUnread: Record<ChatKey, number>;
  chat: ChatKey | null;
  chatTyping: ChatKey | null;
  q: string;
  draft: string;
  lastLike: string | null;
  editing: boolean;
  editColor: string;
  editName: string;
  emoji: boolean;
  story: { i: number; s: number; n: number } | null;
}

/* ---------- persistence (your posts, profile, follows, theme) ---------- */

export const STORAGE_KEY = "dive.murmur.v1";

interface Saved {
  v: 1;
  me: Me;
  theme: "light" | "dark";
  follows: Partial<Record<UserKey, boolean>>;
  mine: Array<Pick<Post, "id" | "text" | "ts" | "likes" | "reposts" | "replies">>;
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
const isUser = (x: unknown): x is UserKey => typeof x === "string" && (USER_KEYS as readonly string[]).includes(x);

function loadSaved(): Partial<Pick<MurmurState, "me" | "theme" | "follows">> & { mine?: Post[] } {
  try {
    const d: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!isObj(d) || d.v !== 1) return {};
    const out: Partial<Pick<MurmurState, "me" | "theme" | "follows">> & { mine?: Post[] } = {};
    if (isObj(d.me) && typeof d.me.color === "string")
      out.me = { name: typeof d.me.name === "string" ? d.me.name.slice(0, 24) : null, color: d.me.color };
    if (d.theme === "dark" || d.theme === "light") out.theme = d.theme;
    if (isObj(d.follows)) {
      const f: Partial<Record<UserKey, boolean>> = {};
      for (const [k, v] of Object.entries(d.follows)) if (isUser(k)) f[k] = v === true;
      out.follows = f;
    }
    if (Array.isArray(d.mine)) {
      out.mine = d.mine
        .filter((p): p is Record<string, unknown> => isObj(p) && typeof p.id === "string" && typeof p.text === "string")
        .slice(0, 30)
        .map((p) => ({
          id: String(p.id),
          u: "me" as const,
          mine: true,
          text: String(p.text).slice(0, 280),
          ts: typeof p.ts === "number" ? p.ts : 0,
          likes: typeof p.likes === "number" ? p.likes : 0,
          reposts: typeof p.reposts === "number" ? p.reposts : 0,
          rbase: 0,
          replies: Array.isArray(p.replies)
            ? p.replies
                .filter((r): r is Record<string, unknown> => isObj(r) && typeof r.text === "string")
                .map((r) => ({ u: isUser(r.u) ? r.u : ("me" as const), text: String(r.text) }))
            : [],
        }));
    }
    return out;
  } catch {
    return {};
  }
}

export function serialize(s: Pick<MurmurState, "me" | "theme" | "follows" | "posts">): string {
  const saved: Saved = {
    v: 1,
    me: s.me,
    theme: s.theme,
    follows: s.follows,
    mine: s.posts
      .filter((p) => p.mine)
      .slice(0, 30)
      .map((p) => ({ id: p.id, text: p.text, ts: p.ts, likes: p.likes, reposts: p.reposts, replies: p.replies })),
  };
  return JSON.stringify(saved);
}

export function persist(json: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, json);
  } catch {
    /* storage full or blocked: the app still works, it just forgets */
  }
}

/* ---------- initial state ---------- */

export function createInitialState(): MurmurState {
  const now = Date.now();
  const min = 60e3;
  const seed: Post[] = [
    { id: "p1", u: "mika", key: "posts.p1", ts: now - 2 * min, likes: 1284, reposts: 41, rbase: 94, pic: 1,
      replies: [{ u: "ana", key: "p1a" }, { u: "jo", key: "p1b" }] },
    { id: "p2", u: "jo", key: "posts.p2", ts: now - 9 * min, likes: 312, reposts: 7, rbase: 18, replies: [] },
    { id: "p3", u: "ana", key: "posts.p3", ts: now - 25 * min, likes: 876, reposts: 120, rbase: 33, replies: [] },
    { id: "p4", u: "sam", key: "posts.p4", ts: now - 62 * min, likes: 540, reposts: 64, rbase: 21, replies: [] },
    { id: "p5", u: "ravi", key: "posts.p5", ts: now - 130 * min, likes: 698, reposts: 88, rbase: 52, pic: 2, replies: [] },
    { id: "p6", u: "lee", key: "posts.p6", ts: now - 200 * min, likes: 221, reposts: 12, rbase: 9, replies: [] },
  ];
  const saved = loadSaved();
  return {
    tab: "home",
    theme: saved.theme ?? "light",
    me: saved.me ?? { name: null, color: ME_COLOR },
    posts: [...(saved.mine ?? []), ...seed],
    open: {},
    follows: saved.follows ?? {},
    followBacks: 0,
    seen: {},
    pending: [],
    loading: false,
    caughtUp: false,
    notifs: [
      { id: "n1", icon: "user", kind: "startedFollowing", who: "sam", ts: now - 30 * min },
      { id: "n2", icon: "reply", kind: "mentioned", who: "ana", ts: now - 50 * min },
    ],
    unread: 2,
    chats: {
      ana: [{ f: "ana", ref: ["chats.ana", 0] }],
      mika: [{ f: "mika", ref: ["chats.mika", 0] }],
      jo: [
        { f: "jo", ref: ["chats.jo", 0] },
        { f: "me", ref: ["chats.jo", 1] },
        { f: "jo", ref: ["chats.jo", 2] },
      ],
    },
    chatUnread: { ana: 1, mika: 1, jo: 0 },
    chat: null,
    chatTyping: null,
    q: "",
    draft: "",
    lastLike: null,
    editing: false,
    editColor: ME_COLOR,
    editName: "",
    emoji: false,
    story: null,
  };
}

/* ---------- reducer ---------- */

export type Action =
  | { type: "tab"; tab: Tab }
  | { type: "restore"; tab: Tab; chat: ChatKey | null }
  | { type: "like"; id: string }
  | { type: "toggleThread"; id: string }
  | { type: "repost"; id: string }
  | { type: "bookmark"; id: string }
  | { type: "bumpLikes"; id: string; n: number }
  | { type: "reply"; id: string; text: string }
  | { type: "query"; q: string }
  | { type: "tag"; tag: string }
  | { type: "storyOpen"; i: number }
  | { type: "storyStep"; d: 1 | -1 }
  | { type: "storyClose" }
  | { type: "follow"; h: UserKey }
  | { type: "followBack"; h: UserKey; notif: Notif; live: boolean }
  | { type: "theme" }
  | { type: "emoji"; open: boolean }
  | { type: "draft"; text: string }
  | { type: "post"; post: Post }
  | { type: "postConfirm"; id: string }
  | { type: "notify"; notif: Notif; live: boolean }
  | { type: "pendingAdd"; post: Post }
  | { type: "showPending" }
  | { type: "loadStart" }
  | { type: "loadDone"; posts: Post[] }
  | { type: "caughtUp" }
  | { type: "chatOpen"; h: ChatKey }
  | { type: "chatBack" }
  | { type: "chatSend"; text: string }
  | { type: "chatTyping"; h: ChatKey }
  | { type: "chatReply"; h: ChatKey; msg: ChatMsg; live: boolean }
  | { type: "editStart"; name: string }
  | { type: "editName"; name: string }
  | { type: "editColor"; color: string }
  | { type: "editCancel" }
  | { type: "editSave"; name: string | null };

const mapPost = (posts: Post[], id: string, fn: (p: Post) => Post) => posts.map((p) => (p.id === id ? fn(p) : p));
const STORY_ORDER = USER_KEYS;

function goTab(s: MurmurState, tab: Tab): MurmurState {
  return {
    ...s,
    tab,
    editing: false,
    unread: tab === "notifs" ? 0 : s.unread,
    chat: tab === "messages" ? s.chat : null,
    caughtUp: false,
    notifs: s.notifs.some((n) => n.fresh) ? s.notifs.map((n) => (n.fresh ? { ...n, fresh: false } : n)) : s.notifs,
    posts: s.posts.some((p) => p.anim === "new") ? s.posts.map((p) => (p.anim === "new" ? { ...p, anim: undefined } : p)) : s.posts,
  };
}

function addNotif(s: MurmurState, n: Notif, live: boolean): MurmurState {
  const notifs = [{ ...n, fresh: true }, ...s.notifs].slice(0, 40);
  return { ...s, notifs, unread: s.tab === "notifs" && live ? s.unread : s.unread + 1 };
}

function storyAt(s: MurmurState, i: number, st: number): MurmurState {
  return { ...s, story: { i, s: st, n: (s.story?.n ?? 0) + 1 }, seen: { ...s.seen, [STORY_ORDER[i]]: true } };
}

export function reducer(s: MurmurState, a: Action): MurmurState {
  switch (a.type) {
    case "tab":
      return goTab(s, a.tab);
    case "restore":
      return { ...goTab(s, a.tab), chat: a.chat };
    case "like":
      return {
        ...s,
        lastLike: a.id,
        posts: mapPost(s.posts, a.id, (p) => ({ ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) })),
      };
    case "toggleThread":
      return { ...s, open: { ...s.open, [a.id]: !s.open[a.id] } };
    case "repost":
      return { ...s, posts: mapPost(s.posts, a.id, (p) => ({ ...p, rp: !p.rp, reposts: p.reposts + (p.rp ? -1 : 1) })) };
    case "bookmark":
      return { ...s, posts: mapPost(s.posts, a.id, (p) => ({ ...p, bm: !p.bm })) };
    case "bumpLikes":
      return { ...s, posts: mapPost(s.posts, a.id, (p) => ({ ...p, likes: p.likes + a.n })) };
    case "reply":
      return { ...s, posts: mapPost(s.posts, a.id, (p) => ({ ...p, replies: [...p.replies, { u: "me", text: a.text }] })) };
    case "query":
      return { ...s, q: a.q };
    case "tag":
      return s.tab === "explore" ? { ...s, q: a.tag } : { ...goTab(s, "explore"), q: a.tag };
    case "storyOpen":
      return storyAt(s, a.i, 0);
    case "storyStep": {
      if (!s.story) return s;
      let { i, s: st } = s.story;
      st += a.d;
      if (st >= STORY_BG[STORY_ORDER[i]].length) {
        i++;
        st = 0;
        if (i >= STORY_ORDER.length) return { ...s, story: null };
      }
      if (st < 0) {
        if (i > 0) i--;
        st = 0;
      }
      return storyAt(s, i, st);
    }
    case "storyClose":
      return s.story ? { ...s, story: null } : s;
    case "follow":
      return { ...s, follows: { ...s.follows, [a.h]: !s.follows[a.h] } };
    case "followBack":
      if (!s.follows[a.h]) return s;
      return addNotif({ ...s, followBacks: s.followBacks + 1 }, a.notif, a.live);
    case "theme":
      return { ...s, theme: s.theme === "dark" ? "light" : "dark" };
    case "emoji":
      return s.emoji === a.open ? s : { ...s, emoji: a.open };
    case "draft":
      return { ...s, draft: a.text };
    case "post":
      return { ...s, posts: [a.post, ...s.posts], draft: "", emoji: false };
    case "postConfirm":
      return { ...s, posts: mapPost(s.posts, a.id, (p) => ({ ...p, anim: undefined })) };
    case "notify":
      return addNotif(s, a.notif, a.live);
    case "pendingAdd":
      return s.pending.length >= 9 ? s : { ...s, pending: [...s.pending, a.post] };
    case "showPending": {
      if (!s.pending.length) return s;
      const add = [...s.pending].reverse().map((p) => ({ ...p, anim: s.tab === "home" ? ("new" as const) : undefined }));
      return { ...s, pending: [], posts: [...add, ...s.posts] };
    }
    case "loadStart":
      return { ...s, loading: true };
    case "loadDone":
      return { ...s, loading: false, posts: [...s.posts, ...a.posts] };
    case "caughtUp":
      return { ...s, caughtUp: true };
    case "chatOpen":
      return { ...s, chat: a.h, chatUnread: { ...s.chatUnread, [a.h]: 0 } };
    case "chatBack":
      return { ...s, chat: null };
    case "chatSend":
      if (!s.chat) return s;
      return { ...s, chats: { ...s.chats, [s.chat]: [...s.chats[s.chat], { f: "me", text: a.text }] } };
    case "chatTyping":
      return { ...s, chatTyping: a.h };
    case "chatReply": {
      const visible = s.tab === "messages" && s.chat === a.h && a.live;
      return {
        ...s,
        chatTyping: null,
        chats: { ...s.chats, [a.h]: [...s.chats[a.h], a.msg] },
        chatUnread: visible ? s.chatUnread : { ...s.chatUnread, [a.h]: 1 },
      };
    }
    case "editStart":
      return { ...s, editing: true, editColor: s.me.color, editName: a.name };
    case "editName":
      return { ...s, editName: a.name };
    case "editColor":
      return { ...s, editColor: a.color };
    case "editCancel":
      return { ...s, editing: false };
    case "editSave":
      return { ...s, editing: false, me: { name: a.name, color: s.editColor } };
  }
}

export const chatUnreadTotal = (s: MurmurState) => CHAT_KEYS.reduce((n, k) => n + s.chatUnread[k], 0);
