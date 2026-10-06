import type { DiveAudio } from "./audio";
import { clamp, ease, lerp, seg } from "./math";
import { captionAt, HOLD_AT, T, toP, TOTAL, type CaptionKey } from "./timeline";
import { DEPTH, panelZ, ringZ, sideOffset, yearAt } from "./tunnel";

/** What the engine needs from the murmur app (implemented by Murmur via an imperative handle). */
export interface AppBridge {
  /** Freeze the app for the dive and return the like button to zoom into. */
  lockTarget(): HTMLElement | null;
  /** Restore the tab/chat/scroll the app had when the dive started. */
  releaseTarget(): void;
  /** The like button to aim at before any dive happened. */
  defaultHero(): HTMLElement | null;
  /** Lets the app own keys first (story viewer, emoji picker). Returns true if consumed. */
  handleKey(e: KeyboardEvent): boolean;
  /** Ambient activity and toasts only run while the app is live (not diving). */
  setLive(live: boolean): void;
}

export interface DiveDom {
  root: HTMLElement;
  track: HTMLElement;
  sApp: HTMLElement;
  browser: HTMLElement;
  sLayers: HTMLElement;
  layers: HTMLElement[];
  wire: HTMLElement;
  wirePath: SVGPathElement;
  packet: SVGCircleElement;
  sTunnel: HTMLElement;
  world: HTMLElement;
  rings: HTMLElement[];
  panels: { el: HTMLElement; tag: HTMLElement }[];
  year: HTMLElement;
  progFill: HTMLElement;
  ticks: HTMLElement[];
  hint: HTMLElement;
}

/** Finds the engine's DOM nodes by class inside the dive root (the scenes render no refs). */
export function collectDom(root: HTMLElement): DiveDom {
  const one = <E extends Element>(sel: string): E => {
    const el = root.querySelector<E>(sel);
    if (!el) throw new Error(`dive: missing ${sel}`);
    return el;
  };
  const all = <E extends Element>(sel: string): E[] => Array.from(root.querySelectorAll<E>(sel));
  const tags = all<HTMLElement>(".world .tag");
  return {
    root,
    track: one(".track"),
    sApp: one(".s-app"),
    browser: one(".browser"),
    sLayers: one(".s-layers"),
    layers: all(".s-layers .layer"),
    wire: one(".wire"),
    wirePath: one(".wpath"),
    packet: one(".pkt"),
    sTunnel: one(".s-tunnel"),
    world: one(".world"),
    rings: all(".world .ringz"),
    panels: all<HTMLElement>(".world .panel").map((el, i) => ({ el, tag: tags[i] })),
    year: one(".year"),
    progFill: one(".prog .fill"),
    ticks: all(".prog .tk"),
    hint: one(".hint"),
  };
}

export interface DiveEngineOptions {
  dom: DiveDom;
  getApp: () => AppBridge | null;
  audio: DiveAudio;
  reduce: boolean;
  onCaption: (key: CaptionKey | null) => void;
  onAutoplay: (playing: boolean) => void;
  /** The tunnel has landed in 1989: Power On's desk takes over from here. */
  onEnd: () => void;
  /** Open on the last tunnel beat (coming back up from the desk) instead of the top. */
  startAtEnd: boolean;
}

export interface DiveEngine {
  showMe(): void;
  replay(): void;
  toggleAutoplay(): void;
  destroy(): void;
}

/**
 * Drives the whole dive from window scroll. Every per-frame write goes straight to DOM nodes
 * (style/attributes) inside one rAF, so React never re-renders during scrolling. React only hears
 * about rare, discrete changes through callbacks (caption changed, autoplay toggled).
 */
export function createDiveEngine(o: DiveEngineOptions): DiveEngine {
  const { dom, audio, reduce } = o;
  const { root, track, sApp, browser, sLayers, layers, wire, wirePath, packet, sTunnel, world, rings, panels, year } = o.dom;
  const disposers: Array<() => void> = [];
  const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    window.addEventListener(type, fn, opts);
    disposers.push(() => window.removeEventListener(type, fn, opts));
  };

  // Only write a style when its value changed (cheap insurance against layout thrash).
  const last = new WeakMap<HTMLElement | SVGElement, Map<string, string>>();
  const setStyle = (el: HTMLElement | SVGElement, prop: string, value: string) => {
    let m = last.get(el);
    if (!m) last.set(el, (m = new Map()));
    if (m.get(prop) === value) return;
    m.set(prop, value);
    el.style.setProperty(prop, value);
  };
  const vis = (el: HTMLElement, op: number) => {
    setStyle(el, "opacity", String(op));
    setStyle(el, "visibility", op <= 0.001 ? "hidden" : "visible");
  };

  let mode: "play" | "dive" = "play";
  let hero: HTMLElement | null = o.getApp()?.defaultHero() ?? null;
  let origin: { x: number; y: number } | null = null;
  let lastWhoosh = -1;
  let lastPanel = -1;
  let lastCaption: CaptionKey | null | undefined;
  let wireLen = 0;
  let panelSide = sideOffset(window.innerWidth);

  /* ---------- static tunnel layout (depends on viewport width) ---------- */
  function layoutTunnel() {
    panelSide = sideOffset(window.innerWidth);
    panels.forEach((pn, k) => {
      const z = panelZ(k);
      const side = k % 2 ? 1 : -1;
      if (reduce) {
        pn.el.style.transform = "translate3d(-170px,-150px,0)";
        pn.tag.style.transform = "translate3d(-150px,100px,0)";
      } else {
        pn.el.style.transform = `translate3d(${side * panelSide - 170}px,-150px,${z}px) rotateY(${-side * 28}deg)`;
        pn.tag.style.transform = `translate3d(${side * panelSide - 150}px,100px,${z}px) rotateY(${-side * 28}deg)`;
      }
    });
  }

  function currentHero(): HTMLElement | null {
    if (hero && hero.isConnected) return hero;
    hero = o.getApp()?.defaultHero() ?? null;
    origin = null;
    return hero;
  }

  /* ---------- render one timeline position ---------- */
  function render(p: number) {
    const cap = captionAt(p);
    if (cap !== lastCaption) {
      lastCaption = cap;
      o.onCaption(cap);
    }

    // scene 1 → zoom into the like button
    const h = currentHero();
    if (h) h.toggleAttribute("data-aim", p > T.aim && p < T.zoomB);
    const z = ease(seg(p, T.zoomA, T.zoomB));
    if (reduce) {
      vis(sApp, 1 - seg(p, T.zoomA, T.zoomB));
      setStyle(browser, "transform", "");
    } else {
      if (h && (!origin || z < 0.001)) {
        // measure the origin with the zoom removed
        const keep = browser.style.transform;
        browser.style.transform = "none";
        const br = browser.getBoundingClientRect();
        const hr = h.getBoundingClientRect();
        if (br.width && br.height) {
          origin = {
            x: ((hr.left + hr.width * 0.3 - br.left) / br.width) * 100,
            y: ((hr.top + hr.height / 2 - br.top) / br.height) * 100,
          };
        }
        browser.style.transform = keep;
      }
      if (origin) setStyle(browser, "transform-origin", `${origin.x}% ${origin.y}%`);
      setStyle(browser, "transform", z < 0.0001 ? "" : `scale(${lerp(1, 40, z * z)})`);
      vis(sApp, 1 - seg(p, T.zoomB - 0.03, T.zoomB));
    }
    if (z > 0.15 && lastWhoosh < 1) {
      audio.whoosh(1.1, 300, 2400);
      lastWhoosh = 1;
    }
    if (p < T.zoomA) lastWhoosh = 0;

    // scene 2: fly through code layers
    const lp = seg(p, T.layA, T.layB);
    vis(sLayers, p > T.layA - 0.01 && p < T.wireB + 0.01 ? 1 : 0);
    const nL = layers.length;
    layers.forEach((el, k) => {
      const u = lp * (nL + 0.6) - k - 0.55; // -1 far, 0 centred, +1 passed
      const op = u < -0.6 ? 0 : u < -0.2 ? (u + 0.6) / 0.4 : u < 0.35 ? 1 : u < 0.6 ? 1 - (u - 0.35) / 0.25 : 0;
      setStyle(el, "opacity", String(op));
      setStyle(el, "z-index", String(100 + Math.round(u * 50)));
      setStyle(el, "transform", reduce ? "none" : `translateZ(${u * 700}px) rotateX(${-u * 8}deg)`);
    });
    const wp = seg(p, T.wireA, T.wireB);
    setStyle(wire, "opacity", String(wp > 0 ? Math.min(1, wp * 3) * (1 - seg(p, T.wireB - 0.02, T.wireB + 0.02)) : 0));
    if (wp > 0) {
      if (!wireLen) wireLen = wirePath.getTotalLength();
      const pt = wirePath.getPointAtLength((1 - wp) * wireLen);
      packet.setAttribute("cx", String(pt.x));
      packet.setAttribute("cy", String(pt.y));
      setStyle(wire, "transform", reduce ? "" : `scale(${lerp(1, 3.2, ease(seg(p, T.wireB - 0.05, T.wireB)))})`);
    }

    // scene 3: tunnel
    const tp = seg(p, T.tunA, T.tunB);
    const tO = Math.min(seg(p, T.tunA, T.tunA + 0.04), 1 - seg(p, T.deskA, T.deskA + 0.03));
    vis(sTunnel, tO);
    const scale = Math.min(1, window.innerWidth / 760) * 0.82 + 0.18;
    const camZ = tp * DEPTH * 1.02;
    setStyle(world, "transform", reduce ? `scale(${scale})` : `scale(${scale}) translateZ(${camZ}px) rotateZ(${tp * 40}deg)`);
    panels.forEach((pn, k) => {
      const dz = panelZ(k) + camZ; // > 0 means behind the camera
      // in reduced motion show the nearest panel, flat
      const op = reduce ? (Math.abs(k - tp * (panels.length - 0.01)) < 0.5 ? 1 : 0) : dz > 120 || dz < -5200 ? 0 : 1;
      setStyle(pn.el, "opacity", String(op));
      setStyle(pn.tag, "opacity", String(op));
    });
    rings.forEach((r, k) => setStyle(r, "opacity", ringZ(k) + camZ > 200 ? "0" : "1"));
    const yr = String(yearAt(tp));
    if (year.textContent !== yr) year.textContent = yr;
    setStyle(year, "opacity", String(tO > 0 ? tO * 0.7 : 0));
    const pi = Math.floor(tp * panels.length);
    if (tp > 0 && tp < 1 && pi !== lastPanel) {
      lastPanel = pi;
      audio.blip(lerp(880, 330, tp));
    }
    if (tp > 0.02 && lastWhoosh < 2) {
      audio.whoosh(2.2, 2400, 200);
      lastWhoosh = 2;
    }

    setStyle(sApp, "pointer-events", mode === "play" ? "auto" : "none");
  }

  /* ---------- scroll ↔ screens ---------- */
  const screensNow = () => window.scrollY / window.innerHeight;
  const scrollToScreens = (sc: number, smooth: boolean) =>
    window.scrollTo({ top: Math.round(sc * window.innerHeight), behavior: smooth && !reduce ? "smooth" : "auto" });
  const sizeTrack = () => {
    track.style.height = `${Math.round((TOTAL + 1) * window.innerHeight)}px`;
  };

  function setMode(next: "play" | "dive") {
    mode = next;
    root.dataset.mode = next;
  }

  function frame() {
    const sc = clamp(screensNow(), 0, TOTAL);
    const s = sc / TOTAL;
    const diving = sc > 0.004;
    const app = o.getApp();
    if (diving && mode === "play") {
      setMode("dive");
      app?.setLive(false);
      hero = app?.lockTarget() ?? currentHero();
      origin = null;
    } else if (!diving && mode === "dive") {
      setMode("play");
      render(0);
      hero?.removeAttribute("data-aim");
      browser.style.transform = "";
      last.get(browser)?.delete("transform");
      origin = null;
      app?.releaseTarget();
      app?.setLive(true);
    }
    const p = toP(sc);
    render(p);
    // once the tunnel has faded out, hand over to the desk (once per arrival)
    if (p >= T.end && !ended) {
      ended = true;
      stop();
      o.onEnd();
    } else if (p < T.end) ended = false;
    setStyle(dom.progFill, "width", `${s * 100}%`);
    dom.ticks.forEach((t, i) => t.classList.toggle("done", sc >= HOLD_AT[i] - 0.05));
    setStyle(dom.hint, "opacity", sc > 0.004 && sc < 1.2 ? "1" : "0");
  }

  let raf = 0;
  let ended = false;
  const onScroll = () => {
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        frame();
      });
  };
  on("scroll", onScroll, { passive: true });

  let lastMax = 0;
  on("resize", () => {
    const frac = lastMax > 0 ? window.scrollY / lastMax : 0;
    sizeTrack();
    lastMax = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, Math.round(frac * lastMax));
    origin = null;
    if (sideOffset(window.innerWidth) !== panelSide) layoutTunnel();
    onScroll();
  });

  /* ---------- beats (keyboard, Show me) ---------- */
  function stepBeat(dir: 1 | -1) {
    const sc = screensNow();
    let target = dir > 0 ? TOTAL : 0;
    if (dir > 0) {
      for (const h of HOLD_AT)
        if (h > sc + 0.05) {
          target = h;
          break;
        }
    } else {
      for (let j = HOLD_AT.length - 1; j >= 0; j--)
        if (HOLD_AT[j] < sc - 0.05) {
          target = HOLD_AT[j];
          break;
        }
    }
    scrollToScreens(target, true);
  }

  /* ---------- optional hands-free play: glides through the whole track ---------- */
  let auto = 0; // rAF id while playing; -1 = starting
  function stop() {
    if (!auto) return;
    if (auto > 0) cancelAnimationFrame(auto);
    auto = 0;
    o.onAutoplay(false);
  }
  function play() {
    audio.ensure();
    if (auto) {
      stop();
      return;
    }
    const startSc = screensNow() >= TOTAL - 0.01 ? 0 : screensNow();
    if (startSc === 0) window.scrollTo(0, 0);
    const t0 = performance.now();
    const dur = (TOTAL - startSc) * (reduce ? 700 : 1700);
    auto = -1;
    o.onAutoplay(true);
    const step = (now: number) => {
      if (!auto) return;
      const t = clamp((now - t0) / dur, 0, 1);
      window.scrollTo(0, Math.round(lerp(startSc, TOTAL, t) * window.innerHeight));
      if (t < 1) auto = requestAnimationFrame(step);
      else stop();
    };
    step(t0);
  }
  on("wheel", () => stop(), { passive: true });
  on("touchstart", () => stop(), { passive: true });

  on("keydown", (e) => {
    const app = o.getApp();
    if (app?.handleKey(e)) return;
    const t = e.target instanceof Element ? e.target : null;
    // keys inside the app (or any field) stay there
    if (t && (t.closest("[data-murmur]") || t.closest("input, textarea, select, [contenteditable]"))) return;
    const fwd = (e.key === " " && !e.shiftKey) || e.key === "PageDown" || e.key === "ArrowDown";
    const back = (e.key === " " && e.shiftKey) || e.key === "PageUp" || e.key === "ArrowUp";
    if (t && t.closest("a, button") && (e.key === " " || e.key === "Enter")) return;
    if (fwd || back) {
      e.preventDefault();
      stop();
      stepBeat(fwd ? 1 : -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      scrollToScreens(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      scrollToScreens(TOTAL, true);
    }
  });

  /* ---------- init ---------- */
  setMode("play");
  layoutTunnel();
  sizeTrack();
  lastMax = track.offsetHeight - window.innerHeight;
  if (o.startAtEnd) scrollToScreens(HOLD_AT[HOLD_AT.length - 2], false);
  if (screensNow() > 0.004) onScroll();
  else render(0);

  return {
    showMe() {
      audio.ensure();
      scrollToScreens(HOLD_AT[0], true);
    },
    replay() {
      stop();
      scrollToScreens(0, true);
    },
    toggleAutoplay: play,
    destroy() {
      stop();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      disposers.forEach((d) => d());
      hero?.removeAttribute("data-aim");
    },
  };
}
