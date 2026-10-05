import { flushSync } from "react-dom";
import { POOL_AUTHORS, type ChatKey, type Tab, type UserKey } from "./data";
import type { Resolver } from "./content";
import type { Action, MurmurState, Notif, NotifIcon, NotifKind, Post } from "./state";

/** Everything the murmur UI can ask for. Created once per mount; reads live values through refs. */
export interface MurmurActions {
  goTab(tab: Tab): void;
  like(id: string): void;
  toggleThread(id: string): void;
  repost(id: string): void;
  bookmark(id: string): void;
  share(id: string): void;
  reply(id: string, text: string): void;
  tag(tag: string): void;
  query(q: string): void;
  openStory(i: number): void;
  storyStep(d: 1 | -1): void;
  closeStory(): void;
  follow(h: UserKey): void;
  toggleTheme(): void;
  setEmoji(open: boolean): void;
  setDraft(text: string): void;
  submitPost(): void;
  showPending(): void;
  composeFocus(): void;
  openChat(h: ChatKey): void;
  chatBack(): void;
  sendMsg(text: string): void;
  editStart(): void;
  editName(name: string): void;
  editColor(color: string): void;
  editCancel(): void;
  editSave(): void;
  loadMore(): void;
  refresh(): void;
  /** one ambient tick (likes trickle in, new posts queue up, someone likes your post) */
  ambient(n: number): void;
}

type Translate = (key: string, values?: Record<string, string | number>) => string;

export interface ActionDeps {
  dispatch: (a: Action) => void;
  state: () => MurmurState;
  view: () => HTMLElement | null;
  resolver: () => Resolver;
  t: () => Translate;
  toast: (text: string) => void;
  later: (fn: () => void, ms: number) => void;
  /** live = the app is on screen and interactive (not diving) */
  live: () => boolean;
  typing: () => boolean;
  reduce: boolean;
  /** per-tab scroll positions of the feed view */
  memory: () => Partial<Record<Tab, number>>;
}

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export interface MurmurController {
  actions: MurmurActions;
  /** Wire the controller to the live component (called from a layout effect, before any event). */
  bind(deps: ActionDeps): void;
}

/**
 * Created once per mount (outside render-time ref access); bound to getters in a layout effect.
 * Until bound, actions are no-ops — nothing can call them before the first commit anyway.
 */
export function createController(): MurmurController {
  let bound: ActionDeps | null = null;
  const d: ActionDeps = {
    dispatch: (x) => bound?.dispatch(x),
    state: () => {
      if (!bound) throw new Error("murmur: controller used before bind");
      return bound.state();
    },
    view: () => bound?.view() ?? null,
    resolver: () => {
      if (!bound) throw new Error("murmur: controller used before bind");
      return bound.resolver();
    },
    t: () => bound?.t() ?? ((k) => k),
    toast: (x) => bound?.toast(x),
    later: (fn, ms) => bound?.later(fn, ms),
    live: () => bound?.live() ?? false,
    typing: () => bound?.typing() ?? false,
    get reduce() {
      return bound?.reduce ?? false;
    },
    memory: () => bound?.memory() ?? {},
  };
  return {
    actions: createActions(d),
    bind(deps) {
      bound = deps;
    },
  };
}

function createActions(d: ActionDeps): MurmurActions {
  let seq = 0;
  let pool = 0;
  let loading = false;
  const uid = (p: string) => `${p}${Date.now().toString(36)}${seq++}`;
  const name = (k: UserKey) => d.resolver().author(k).name;
  const focusIn = (sel: string) => d.view()?.querySelector<HTMLElement>(sel)?.focus();
  const smoothTop = () => d.view()?.scrollTo({ top: 0, behavior: d.reduce ? "auto" : "smooth" });

  function notify(kind: NotifKind, icon: NotifIcon, who: UserKey) {
    const notif: Notif = { id: uid("n"), icon, kind, who, ts: Date.now() };
    d.dispatch({ type: "notify", notif, live: d.live() });
    if (!d.typing() && d.live()) d.toast(d.t()(`app.notif.${kind}`, { name: name(who) }));
  }

  function poolPost(): Post {
    const i = pool++ % POOL_AUTHORS.length;
    return { id: uid("q"), u: POOL_AUTHORS[i], key: `pool.${i}`, ts: Date.now(), likes: rnd(3, 240), reposts: rnd(0, 30), rbase: rnd(0, 20), replies: [] };
  }

  const a: MurmurActions = {
    goTab(tab) {
      const s = d.state();
      const view = d.view();
      if (view) d.memory()[s.tab] = view.scrollTop;
      if (tab === s.tab && tab === "home") {
        d.memory().home = 0;
        smoothTop();
        return;
      }
      d.dispatch({ type: "tab", tab });
    },
    like: (id) => d.dispatch({ type: "like", id }),
    toggleThread(id) {
      const opening = !d.state().open[id];
      flushSync(() => d.dispatch({ type: "toggleThread", id }));
      if (opening) focusIn(`.post[data-id="${id}"] .rin`);
    },
    repost(id) {
      const p = d.state().posts.find((x) => x.id === id);
      d.dispatch({ type: "repost", id });
      d.toast(d.t()(p?.rp ? "app.toast.repostRemoved" : "app.toast.reposted"));
    },
    bookmark(id) {
      const p = d.state().posts.find((x) => x.id === id);
      d.dispatch({ type: "bookmark", id });
      d.toast(d.t()(p?.bm ? "app.toast.unbookmarked" : "app.toast.bookmarked"));
    },
    share(id) {
      const short = `murmur.app/p/${id}`;
      const fallback = () => d.toast(d.t()("app.toast.link", { url: short }));
      try {
        navigator.clipboard.writeText(`https://${short}`).then(() => d.toast(d.t()("app.toast.linkCopied")), fallback);
      } catch {
        fallback();
      }
    },
    reply(id, text) {
      const p = d.state().posts.find((x) => x.id === id);
      if (!p) return;
      d.dispatch({ type: "reply", id, text });
      d.toast(d.t()("app.toast.replySent"));
      if (!p.mine && p.u !== "me") {
        const who = p.u;
        d.later(() => notify("likedReply", "heart", who), 2200);
      }
    },
    tag(tag) {
      const s = d.state();
      const view = d.view();
      if (view && s.tab !== "explore") d.memory()[s.tab] = view.scrollTop;
      d.dispatch({ type: "tag", tag });
    },
    query: (q) => d.dispatch({ type: "query", q }),
    openStory: (i) => d.dispatch({ type: "storyOpen", i }),
    storyStep: (dir) => d.dispatch({ type: "storyStep", d: dir }),
    closeStory: () => d.dispatch({ type: "storyClose" }),
    follow(h) {
      const on = !d.state().follows[h];
      d.dispatch({ type: "follow", h });
      if (on) {
        d.toast(d.t()("app.toast.following", { name: name(h) }));
        d.later(() => {
          if (!d.state().follows[h]) return;
          const notif: Notif = { id: uid("n"), icon: "user", kind: "followedBack", who: h, ts: Date.now() };
          d.dispatch({ type: "followBack", h, notif, live: d.live() });
          if (!d.typing() && d.live()) d.toast(d.t()("app.notif.followedBack", { name: name(h) }));
        }, 1800);
      }
    },
    toggleTheme: () => d.dispatch({ type: "theme" }),
    setEmoji: (open) => d.dispatch({ type: "emoji", open }),
    setDraft: (text) => d.dispatch({ type: "draft", text }),
    submitPost() {
      const text = d.state().draft.trim();
      if (!text || text.length > 280) return;
      const post: Post = { id: uid("m"), u: "me", mine: true, text, ts: Date.now(), likes: 0, reposts: 0, rbase: 0, replies: [], anim: "pending" };
      d.dispatch({ type: "post", post });
      d.later(() => {
        d.dispatch({ type: "postConfirm", id: post.id });
        d.toast(d.t()("app.toast.posted"));
      }, 550);
      d.later(() => {
        d.dispatch({ type: "bumpLikes", id: post.id, n: rnd(1, 3) });
        notify("likedPost", "heart", pick(["ana", "mika", "jo"] as const));
      }, 2600);
    },
    showPending() {
      const s = d.state();
      if (!s.pending.length) return;
      d.dispatch({ type: "showPending" });
      if (s.tab === "home") smoothTop();
    },
    composeFocus() {
      if (d.state().tab !== "home") flushSync(() => a.goTab("home"));
      const view = d.view();
      if (view) view.scrollTop = 0;
      focusIn("textarea");
    },
    openChat(h) {
      flushSync(() => d.dispatch({ type: "chatOpen", h }));
      focusIn(".mform input");
    },
    chatBack: () => d.dispatch({ type: "chatBack" }),
    sendMsg(text) {
      const h = d.state().chat;
      if (!h || !text) return;
      d.dispatch({ type: "chatSend", text });
      d.later(() => d.dispatch({ type: "chatTyping", h }), 450);
      d.later(() => {
        const live = d.live();
        const replies = d.resolver().content.botReplies[h] ?? [];
        d.dispatch({ type: "chatReply", h, msg: { f: h, ref: [`botReplies.${h}`, Math.floor(Math.random() * replies.length)] }, live });
        const s = d.state();
        if (!(s.tab === "messages" && s.chat === h && live)) d.toast(d.t()("app.toast.messaged", { name: name(h).split(" ")[0] }));
      }, 1700);
    },
    editStart() {
      flushSync(() => d.dispatch({ type: "editStart", name: d.resolver().meName }));
      focusIn("#murmur-pname");
    },
    editName: (n) => d.dispatch({ type: "editName", name: n }),
    editColor: (color) => d.dispatch({ type: "editColor", color }),
    editCancel: () => d.dispatch({ type: "editCancel" }),
    editSave() {
      const n = d.state().editName.trim().slice(0, 24);
      d.dispatch({ type: "editSave", name: n || null });
      d.toast(d.t()("app.toast.profileSaved"));
    },
    loadMore() {
      const s = d.state();
      if (loading || s.loading || s.tab !== "home") return;
      if (s.posts.length >= 40) {
        if (!s.caughtUp) d.dispatch({ type: "caughtUp" });
        return;
      }
      loading = true;
      d.dispatch({ type: "loadStart" });
      d.later(() => {
        const n = d.state().posts.length;
        const add = [poolPost(), poolPost(), poolPost()].map((p, i) => ({ ...p, ts: Date.now() - (300 + n * 40 + i * 20) * 60e3 }));
        d.dispatch({ type: "loadDone", posts: add });
        loading = false;
      }, d.reduce ? 150 : 750);
    },
    refresh() {
      if (!d.state().pending.length) d.dispatch({ type: "pendingAdd", post: poolPost() });
      a.showPending();
      d.toast(d.t()("app.toast.refreshed"));
    },
    ambient(n) {
      const s = d.state();
      const view = d.view();
      if (view) {
        const ids = Array.from(view.querySelectorAll<HTMLElement>(".post[data-id]"), (el) => el.dataset.id ?? "");
        const cands = ids.filter((id) => s.posts.some((p) => p.id === id && !p.mine));
        if (cands.length) d.dispatch({ type: "bumpLikes", id: pick(cands), n: rnd(1, 3) });
      }
      if (n % 10 === 0 && s.pending.length < 9) d.dispatch({ type: "pendingAdd", post: poolPost() });
      if (n % 17 === 0) {
        const mine = s.posts.filter((p) => p.mine);
        if (mine.length) {
          d.dispatch({ type: "bumpLikes", id: pick(mine).id, n: 1 });
          notify("likedPost", "heart", pick(["lee", "ravi", "sam"] as const));
        } else if (n % 34 === 0) notify("repostedLaunch", "repost", pick(["lee", "ravi"] as const));
      }
    },
  };
  return a;
}
