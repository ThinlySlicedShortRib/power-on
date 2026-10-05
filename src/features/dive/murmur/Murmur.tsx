"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useReducer, useRef, useState, type Ref, type TouchEvent } from "react";
import { flushSync } from "react-dom";
import type { AppBridge } from "../engine/diveEngine";
import { clamp } from "../engine/math";
import { createController, type MurmurActions } from "./actions";
import { Logo } from "./bits";
import { useResolver, type Resolver } from "./content";
import { TABS, type ChatKey, type Tab } from "./data";
import { Home } from "./Home";
import { Icon, type IconName } from "./icons";
import { chatUnreadTotal, createInitialState, persist, reducer, serialize, type MurmurState } from "./state";
import { StoryViewer } from "./StoryViewer";
import { Explore, Messages, Notifications, Profile, Rail } from "./Views";

const TAB_ICON: Record<Tab, IconName> = { home: "home", explore: "search", notifs: "bell", messages: "mail", profile: "user" };

function useTimers() {
  const ids = useRef<Set<number>>(new Set());
  useEffect(() => {
    const set = ids.current;
    return () => {
      set.forEach((id) => window.clearTimeout(id));
      set.clear();
    };
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      ids.current.delete(id);
      fn();
    }, ms);
    ids.current.add(id);
  }, []);
}

function useToast() {
  const [toast, setToast] = useState({ text: "", show: false });
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const show = useCallback((text: string) => {
    setToast({ text, show: true });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast((s) => ({ ...s, show: false })), 2100);
  }, []);
  return [toast, show] as const;
}

function inViewport(view: HTMLElement, btn: Element) {
  const vr = view.getBoundingClientRect();
  const r = btn.getBoundingClientRect();
  return btn.getClientRects().length > 0 && r.top >= vr.top + 8 && r.bottom <= vr.bottom - 8;
}

function Nav({ s, labels, actions }: { s: MurmurState; labels: boolean; actions: MurmurActions }) {
  const t = useTranslations("dive.app.nav");
  const badges: Partial<Record<Tab, number>> = { notifs: s.unread, messages: chatUnreadTotal(s) };
  return (
    <>
      {TABS.map((tab) => {
        const on = s.tab === tab;
        const n = badges[tab] ?? 0;
        return (
          <button key={tab} type="button" className={on ? "navb on" : "navb"} aria-label={t(tab)} aria-current={on ? "page" : undefined} onClick={() => actions.goTab(tab)}>
            <Icon name={TAB_ICON[tab]} />
            {labels && <span>{t(tab)}</span>}
            {n > 0 && <span className="bdg">{n}</span>}
          </button>
        );
      })}
    </>
  );
}

function ThemeButton({ dark, labeled, actions }: { dark: boolean; labeled: boolean; actions: MurmurActions }) {
  const t = useTranslations("dive.app");
  return (
    <button type="button" className={labeled ? "navb" : "iconbtn"} aria-label={dark ? t("toLight") : t("toDark")} onClick={actions.toggleTheme}>
      <Icon name={dark ? "sun" : "moon"} />
      {labeled && <span>{dark ? t("lightMode") : t("darkMode")}</span>}
    </button>
  );
}

function urlPath(s: MurmurState) {
  if (s.tab === "notifs") return "notifications";
  if (s.tab === "messages" && s.chat) return `messages/${s.chat}`;
  return s.tab;
}

/**
 * murmur: the playable app inside the landing's browser frame.
 * Renders the browser chrome's URL bar and the app. Exposes an AppBridge to the dive engine.
 */
export function Murmur({ ref, reduce }: { ref: Ref<AppBridge>; reduce: boolean }) {
  const tDive = useTranslations("dive");
  const t = useTranslations("dive.app");
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const r = useResolver(state.me);
  const [now, setNow] = useState(() => performance.timeOrigin + performance.now());
  const [toast, showToast] = useToast();
  const later = useTimers();

  const viewRef = useRef<HTMLElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const resolverRef = useRef<Resolver>(r);
  const tRef = useRef(tDive);
  const liveRef = useRef(true);
  const typingRef = useRef(false);
  const scrollMemory = useRef<Partial<Record<Tab, number>>>({});
  const lockRef = useRef<{ tab: Tab; chat: ChatKey | null; scroll: number } | null>(null);
  const ptr = useRef<{ y: number | null; d: number }>({ y: null, d: 0 });

  useLayoutEffect(() => {
    stateRef.current = state;
    resolverRef.current = r;
    tRef.current = tDive;
  });

  const [{ actions, bind }] = useState(createController);
  useLayoutEffect(() => {
    bind({
      dispatch,
      state: () => stateRef.current,
      view: () => viewRef.current,
      resolver: () => resolverRef.current,
      t: () => (key, values) => tRef.current(key, values),
      toast: showToast,
      later,
      live: () => liveRef.current,
      typing: () => typingRef.current,
      reduce,
      memory: () => scrollMemory.current,
    });
  }, [bind, showToast, later, reduce]);

  // persistence: your posts, profile, follows, theme
  const savedJson = useRef<string | null>(null);
  const { me, theme, follows, posts } = state;
  useEffect(() => {
    const json = serialize({ me, theme, follows, posts });
    if (json === savedJson.current) return;
    savedJson.current = json;
    persist(json);
  }, [me, theme, follows, posts]);

  // relative timestamps + ambient life (paused while typing, during the dive, or in a hidden tab)
  useEffect(() => {
    let n = 0;
    const tick = window.setInterval(() => {
      if (!liveRef.current || typingRef.current || document.hidden) return;
      n++;
      actions.ambient(n);
      if (n % 30 === 0) setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(tick);
  }, [actions]);

  // each tab remembers its own scroll position
  useLayoutEffect(() => {
    const v = viewRef.current;
    if (v) v.scrollTop = scrollMemory.current[state.tab] ?? 0;
  }, [state.tab, state.chat]);

  useImperativeHandle(
    ref,
    (): AppBridge => ({
      lockTarget() {
        const view = viewRef.current;
        if (!view) return null;
        const s = stateRef.current;
        lockRef.current = { tab: s.tab, chat: s.chat, scroll: view.scrollTop };
        const sel = (id: string) => view.querySelector<HTMLElement>(`.post[data-id="${CSS.escape(id)}"] .like`);
        let btn = s.lastLike ? sel(s.lastLike) : null;
        if (!btn || !inViewport(view, btn)) {
          const visible = Array.from(view.querySelectorAll<HTMLElement>(".post .like")).filter((b) => inViewport(view, b));
          btn = btn && btn.getClientRects().length ? btn : (visible[0] ?? null);
        }
        if (!btn) {
          flushSync(() => actions.goTab("home"));
          btn = (s.lastLike ? sel(s.lastLike) : null) ?? sel("p1") ?? view.querySelector<HTMLElement>(".post .like");
        }
        if (btn && !inViewport(view, btn)) {
          const post = btn.closest(".post");
          if (post) {
            const vr = view.getBoundingClientRect();
            const pr = post.getBoundingClientRect();
            view.scrollTop += pr.top - vr.top - Math.max(0, (view.clientHeight - pr.height) / 2);
          }
        }
        flushSync(() => {
          dispatch({ type: "storyClose" });
          dispatch({ type: "emoji", open: false });
        });
        const active = document.activeElement;
        if (active instanceof HTMLElement && appRef.current?.contains(active)) active.blur();
        return btn;
      },
      releaseTarget() {
        const view = viewRef.current;
        const lock = lockRef.current;
        lockRef.current = null;
        if (!view || !lock) return;
        const s = stateRef.current;
        if (lock.tab !== s.tab || lock.chat !== s.chat) {
          scrollMemory.current[s.tab] = view.scrollTop;
          flushSync(() => dispatch({ type: "restore", tab: lock.tab, chat: lock.chat }));
        }
        view.scrollTop = lock.scroll;
      },
      defaultHero() {
        const view = viewRef.current;
        return view?.querySelector<HTMLElement>('.post[data-id="p1"] .like') ?? view?.querySelector<HTMLElement>(".post .like") ?? null;
      },
      handleKey(e) {
        const s = stateRef.current;
        if (s.story) {
          // the story viewer owns the keys while open
          if (e.key === "Escape") actions.closeStory();
          else if (e.key === "ArrowRight") actions.storyStep(1);
          else if (e.key === "ArrowLeft") actions.storyStep(-1);
          else return true;
          e.preventDefault();
          return true;
        }
        if (e.key === "Escape" && s.emoji) {
          actions.setEmoji(false);
          return true;
        }
        return false;
      },
      setLive(live) {
        liveRef.current = live;
      },
    }),
    [actions],
  );

  /* pull-to-refresh on touch */
  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    const v = viewRef.current;
    ptr.current = { y: stateRef.current.tab === "home" && v && v.scrollTop <= 0 ? e.touches[0].clientY : null, d: 0 };
  };
  const onTouchMove = (e: TouchEvent<HTMLElement>) => {
    const p = ptr.current;
    if (p.y === null) return;
    p.d = e.touches[0].clientY - p.y;
    const el = viewRef.current?.querySelector<HTMLElement>(".ptr");
    if (!el) return;
    el.style.height = `${clamp(p.d * 0.5, 0, 56)}px`;
    el.textContent = p.d > 90 ? t("releaseToRefresh") : t("pullToRefresh");
  };
  const onTouchEnd = () => {
    const el = viewRef.current?.querySelector<HTMLElement>(".ptr");
    if (el) el.style.height = "0";
    if (ptr.current.y !== null && ptr.current.d > 90) actions.refresh();
    ptr.current = { y: null, d: 0 };
  };
  const onScroll = () => {
    const v = viewRef.current;
    if (v && stateRef.current.tab === "home" && v.scrollTop + v.clientHeight > v.scrollHeight - 180) actions.loadMore();
  };
  const isField = (el: EventTarget) => el instanceof HTMLElement && el.matches("input, textarea");

  const s = state;
  const props = { s, r, now, actions, reduce };
  const dark = s.theme === "dark";

  return (
    <>
      <div className="chrome">
        <div className="dots">
          <i />
          <i />
          <i />
        </div>
        <div className="url">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>murmur.app/{urlPath(s)}</span>
        </div>
      </div>
      <div
        className="app-wrap"
        data-theme={s.theme}
        data-murmur=""
        ref={appRef}
        onFocus={(e) => {
          if (isField(e.target)) typingRef.current = true;
        }}
        onBlur={(e) => {
          if (isField(e.target)) typingRef.current = false;
        }}
      >
        <div className="app">
          <aside className="side">
            <Logo />
            <Nav s={s} labels actions={actions} />
            <button type="button" className="bigpost" onClick={actions.composeFocus}>
              {t("post")}
            </button>
            <div className="spacer" />
            <ThemeButton dark={dark} labeled actions={actions} />
          </aside>
          <div className="mtop">
            <Logo />
            <ThemeButton dark={dark} labeled={false} actions={actions} />
          </div>
          <main
            className={s.tab === "messages" && s.chat ? "view chatmode" : "view"}
            aria-live="off"
            ref={viewRef}
            onScroll={onScroll}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {s.tab === "home" && <Home {...props} />}
            {s.tab === "explore" && <Explore {...props} />}
            {s.tab === "notifs" && <Notifications {...props} />}
            {s.tab === "messages" && <Messages {...props} />}
            {s.tab === "profile" && <Profile {...props} />}
          </main>
          <aside className="rail">
            <Rail s={s} r={r} actions={actions} />
          </aside>
          <nav className="tabbar" aria-label={t("sections")}>
            <Nav s={s} labels={false} actions={actions} />
          </nav>
        </div>
        {s.story && <StoryViewer i={s.story.i} s={s.story.s} n={s.story.n} r={r} actions={actions} />}
        <div className={toast.show ? "toast show" : "toast"} role="status" aria-live="polite">
          {toast.text}
        </div>
      </div>
    </>
  );
}
