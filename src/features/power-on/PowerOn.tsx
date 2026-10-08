"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Autoplay } from "@/features/controls/autoplay";
import { Advance } from "@/features/controls/Advance";
import { Controls } from "@/features/controls/Controls";
import { PowerOnContext, type PowerOnCtx } from "./components/context";
import { EraFx } from "./components/EraFx";
import { GpuNotice } from "./components/GpuNotice";
import { Hud } from "./components/Hud";
import { Intro } from "./components/Intro";
import { Narration, type StoryPos } from "./components/Narration";
import { Shortcuts } from "./components/Shortcuts";
import { Stage } from "./components/Stage";
import { TooltipLayer } from "./components/Tooltip";
import { ERAS, TRANS_KEYS } from "./content/eras";
import { acquireDesk, Desk, lerpPose, type DeskText } from "./engine/desk";
import { Dioramas } from "./engine/dioramas";
import { clamp, ease, isTouch, prefersReducedMotion } from "./engine/env";
import { loadCanvasFonts, resolveFonts } from "./engine/fonts";
import { Music } from "./engine/music";
import { ScrollTrack } from "./engine/scroll";
import { AudioEngine } from "./engine/sfx";
import { consumeResume, peekResume, saveResume } from "./engine/storage";
import { useStoryText } from "./i18n/rich";
import "./styles/power-on.css";
import "./styles/power-on-extra.css";

type Mode = "intro" | "booting" | "story";

const FWD = new Set([" ", "ArrowRight", "ArrowDown", "Enter", "PageDown"]);
const BACK = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);

export interface PowerOnProps {
  /** shared with the landing so it carries on across the handoff */
  autoplay: Autoplay;
  /** scrolling up from the desk (intro) goes back into the landing's time tunnel */
  onBack?: () => void;
  /** "Replay intro" and "Power off & start again" hand back to the top of the landing instead of the local intro */
  onReplayIntro?: () => void;
}

/**
 * Power On: a dark room, a NeXTcube, and the story of the web told one line at a time across six eras.
 * Three.js desk, WebAudio music and SFX, and scroll tracking run as imperative engines driven through refs;
 * React renders only when the line, era or mode changes.
 */
export function PowerOn({ autoplay, onBack, onReplayIntro }: PowerOnProps) {
  const text = useStoryText();
  const { t } = text;

  const [reduce] = useState(prefersReducedMotion);
  const [touch] = useState(isTouch);
  const [audio] = useState(() => new AudioEngine());
  const [music] = useState(() => new Music(audio));
  const [mode, setMode] = useState<Mode>("intro");
  const [introGone, setIntroGone] = useState(false);
  // the opening shot's caption beat (0–2), or -1 once the desk is shown; a locale switch on the desk skips it
  const [opening, setOpening] = useState(() => (peekResume() ? -1 : 0));
  const openingRef = useRef(opening);
  const openingManual = useRef(false);
  const pullRef = useRef<{ start: number; dur: number } | null>(null);
  const [pos, setPos] = useState<StoryPos>({ era: 0, beat: -1, typed: false });
  const [transIdx, setTransIdx] = useState(0);
  const [keysOpen, setKeysOpen] = useState(false);
  const [gpuOff, setGpuOff] = useState(false);
  const [soundOn, setSoundOn] = useState(audio.soundOn);
  const [musicOn, setMusicOn] = useState(music.on);
  const [vol, setVol] = useState(music.vol);

  const rootRef = useRef<HTMLDivElement>(null);
  const glHost = useRef<HTMLDivElement>(null);
  const noglRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const transRef = useRef<HTMLDivElement>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  const keysOpenRef = useRef(false);
  const onBackRef = useRef(onBack);
  const autoRef = useRef(autoplay);
  useEffect(() => { posRef.current = pos; keysOpenRef.current = keysOpen; onBackRef.current = onBack; autoRef.current = autoplay; });

  const [dioramas] = useState(() => new Dioramas());
  const ctx = useMemo<PowerOnCtx>(() => ({ audio, music, dioramas, reduce, touch }), [audio, music, dioramas, reduce, touch]);

  const deskText = useMemo<DeskText>(() => {
    const L = (k: string) => t(`desk.${k}`);
    return {
      boot: L("boot").split("\n"), sticky: L("sticky").split("\n"), e1: L("e1").split("\n"),
      e2Marquee: L("e2Marquee"), e2Title1: L("e2Title1"), e2Title2: L("e2Title2"), e2Links: L("e2Links"), e2Link1: L("e2Link1"), e2Link2: L("e2Link2"), e2Link3: L("e2Link3"),
      e3Logo: L("e3Logo"), e3Beta: L("e3Beta"), e3Head: L("e3Head"), e3Sub1: L("e3Sub1"), e3Sub2: L("e3Sub2"), e3Cta: L("e3Cta"), e3Tags: L("e3Tags").split("\n"), e3Badge: L("e3Badge"),
      e4Logo: L("e4Logo"), e4Head: L("e4Head"), e5Head: L("e5Head"), e5Sub: L("e5Sub"), e5Phone: L("e5Phone"), e6Intent: L("e6Intent"), e6Head1: L("e6Head1"), e6Head2: L("e6Head2"),
    };
  }, [t]);
  const deskTextRef = useRef(deskText);

  /** imperative controller, built once per mount; JSX handlers call through this ref */
  const ctl = useRef<{
    startPower: () => void; powerOff: () => void; advance: (d: 1 | -1) => boolean; toggleSound: () => void; toggleMusic: () => void;
    setVolume: (v: number) => void; desk: Desk | null; beforeLocale: () => void;
  } | null>(null);

  useEffect(() => {
    const root = rootRef.current!, screen = screenRef.current!, trans = transRef.current!, fin = finRef.current!, track = trackRef.current!, nogl = noglRef.current!;
    const body = document.body;
    audio.revive();
    dioramas.setVisibility(() => screen.classList.contains("po-live") && Number(screen.style.opacity || 0) >= 0.05);
    body.classList.add("po-body", "po-locked");
    const scroll = new ScrollTrack(ERAS.map((e) => e.lines.length));
    let modeNow: Mode = "intro";
    let lastOrder = -1, posKey = "", transNow = -1, alive = true;
    let lastW = innerWidth;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => { const id = window.setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    // --- desk (WebGL) with CSS fallback
    let desk: Desk | null = null;
    let fonts = resolveFonts();
    try { desk = acquireDesk(glHost.current!, deskTextRef.current, fonts, reduce); } catch { desk = null; }
    const setNoGl = (on: boolean) => nogl.classList.toggle("po-on", on);
    if (!desk) setNoGl(true);
    else desk.onContextLost = () => { desk?.dispose(); desk = null; c.desk = null; setNoGl(true); setGpuOff(true); };
    // the opening starts with the camera on the cube's note; without WebGL there is no shot, so go straight to the desk
    if (desk) desk.closeUp = openingRef.current >= 0 ? 1 : 0;
    else if (openingRef.current >= 0) { openingRef.current = -1; setOpening(-1); }
    setGpuOff(!desk || desk.software);
    loadCanvasFonts(fonts).then(() => { if (!alive) return; fonts = resolveFonts(); desk?.repaint(deskTextRef.current, fonts); });

    const setScreen = (o: number) => {
      screen.style.opacity = String(o);
      screen.classList.toggle("po-live", o > 0.005);
      screen.style.pointerEvents = o > 0.6 ? "auto" : "none";
      if (desk) desk.glNeeded = o < 0.999 || modeNow !== "story";
    };

    const setBeat = (era: number, beat: number, order?: number) => {
      const key = era + ":" + beat;
      if (key === posKey) return;
      posKey = key;
      const fwd = order == null || order > lastOrder;
      if (order != null) lastOrder = order;
      setPos({ era, beat, typed: fwd });
    };

    const update = () => {
      if (modeNow !== "story") return;
      const { seg, p } = scroll.at(window.scrollY);
      let transO = 0, finO = 0;
      if (seg.k === "beat") {
        if (desk) { desk.rigA = seg.e; desk.rigB = -1; desk.swapQ = 0; desk.pose = desk.rigPoses(seg.e).inPose; }
        setBeat(seg.e, seg.b, seg.o); setScreen(1);
      } else if (seg.k === "trans") {
        const a = seg.e, b = a + 1, so = p < 0.15 ? 1 - p / 0.15 : p > 0.85 ? (p - 0.85) / 0.15 : 0;
        if (p < 0.5) setBeat(a, ERAS[a].lines.length - 1); else setBeat(b, -1);
        setScreen(so);
        if (desk) {
          desk.rigA = a; desk.rigB = b; desk.swapQ = ease((p - 0.38) / 0.24);
          const A = desk.rigPoses(a), B = desk.rigPoses(b);
          desk.pose = p < 0.15 ? A.inPose : p < 0.4 ? lerpPose(A.inPose, A.out, ease((p - 0.15) / 0.25)) : p < 0.6 ? lerpPose(A.out, B.out, ease((p - 0.4) / 0.2)) : p < 0.85 ? lerpPose(B.out, B.inPose, ease((p - 0.6) / 0.25)) : B.inPose;
        }
        transO = clamp(1 - Math.abs(p - 0.5) / 0.26);
        if (transNow !== a) { transNow = a; setTransIdx(a); }
      } else {
        const e = seg.e;
        if (desk) { desk.rigA = e; desk.rigB = -1; desk.swapQ = 0; const P = desk.rigPoses(e); desk.pose = lerpPose(P.inPose, P.out, ease(p / 0.6)); }
        setBeat(e, ERAS[e].lines.length - 1);
        setScreen(clamp(1 - p / 0.2));
        finO = clamp((p - 0.45) / 0.3);
      }
      trans.style.opacity = String(transO);
      fin.style.opacity = String(finO);
      fin.classList.toggle("po-on", finO > 0.5);
      setNoGl(!desk && (transO > 0 || finO > 0));
    };

    const buildTrack = () => { track.style.height = scroll.build(innerHeight) + "px"; };

    const handOver = (to?: { era: number; beat: number }) => {
      if (!alive) return;
      modeNow = "story"; setMode("story"); setIntroGone(true);
      desk?.handOverDone();
      buildTrack();
      window.scrollTo(0, to ? scroll.yFor(to.era, to.beat) : 0);
      body.classList.remove("po-locked");
      lastOrder = to ? Infinity : -1; posKey = "";
      screen.style.transition = "opacity .8s";
      update();
      later(() => { screen.style.transition = ""; update(); }, 900);
      audio.humFade(5);
      later(() => { if (modeNow === "story") music.start(ERAS[posRef.current.era].n); }, to ? 300 : 1800);
    };

    const startPower = () => {
      if (modeNow !== "intro") return;
      audio.ensure();
      audio.startHum();
      setIntroGone(true);
      modeNow = "booting"; setMode("booting");
      if (desk) { desk.onHandOver = () => handOver(); desk.startBoot(); }
      else later(() => handOver(), reduce ? 200 : 1600);
    };

    const powerOffLocal = () => {
      audio.humFade(0.5); music.stop();
      modeNow = "intro"; setMode("intro"); setIntroGone(false);
      window.scrollTo(0, 0); body.classList.add("po-locked");
      setScreen(0);
      if (desk) desk.glNeeded = true;
      fin.style.opacity = "0"; fin.classList.remove("po-on"); trans.style.opacity = "0";
      scroll.cancel();
      track.style.height = "0px";
      posKey = ""; lastOrder = -1;
      setPos({ era: 0, beat: -1, typed: false });
      desk?.powerOff();
      setNoGl(!desk);
    };

    const advance = (dir: 1 | -1) => {
      if (modeNow !== "story") return false;
      const moved = scroll.advance(dir, reduce);
      return moved;
    };
    // the reader taking over (scroll, swipe, keys, clicks) pauses autoplay
    const takeOver = () => { if (modeNow === "story") autoRef.current.setPlaying(false); };

    const c = {
      desk,
      startPower,
      powerOff: () => {
        if (onReplayIntro) { audio.humFade(0.3); music.stop(); body.classList.remove("po-locked"); window.scrollTo(0, 0); onReplayIntro(); return; }
        powerOffLocal();
      },
      advance,
      toggleSound: () => { audio.ensure(); audio.setSound(!audio.soundOn); setSoundOn(audio.soundOn); music.applyLevel(); },
      toggleMusic: () => {
        audio.ensure();
        music.setOn(!music.on); setMusicOn(music.on);
        if (music.on && modeNow === "story" && !music.started) music.start(ERAS[posRef.current.era].n);
        music.applyLevel();
      },
      setVolume: (v: number) => { music.setVolume(v); setVol(music.vol); },
      // era -1 = the desk (intro), so the landing reopens here rather than at the top
      beforeLocale: () => {
        if (modeNow === "story") saveResume({ era: posRef.current.era, beat: posRef.current.beat });
        else if (modeNow === "intro") saveResume({ era: -1, beat: -1 });
      },
    };
    ctl.current = c;

    // --- input
    const onScroll = () => requestAnimationFrame(update);
    const onCancel = () => { scroll.cancel(); takeOver(); };
    const onResize = () => {
      desk?.resize();
      if (modeNow === "story" && (innerWidth !== lastW || Math.abs(innerHeight - scroll.vh) > 140)) {
        const ratio = window.scrollY / scroll.vh;
        buildTrack();
        window.scrollTo(0, ratio * scroll.vh);
      }
      lastW = innerWidth;
      update();
    };
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement, tag = (tgt.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || tgt.isContentEditable;
      if (keysOpenRef.current) {
        if (e.key === "Escape") { e.preventDefault(); setKeysOpen(false); }
        else if (e.key !== "Tab") { e.stopImmediatePropagation(); if (e.key !== "Enter" || tag !== "button") e.preventDefault(); }
        return;
      }
      if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "?") { e.preventDefault(); e.stopImmediatePropagation(); setKeysOpen(true); return; }
      if (e.key === "m" || e.key === "M") { c.toggleMusic(); return; }
      if (e.key === "s" || e.key === "S") { c.toggleSound(); return; }
      if (modeNow === "intro" && openingRef.current >= 0) {
        if (FWD.has(e.key) && !((e.key === " " || e.key === "Enter") && tag === "button")) { e.preventDefault(); nextOpeningRef.current(true); }
        return;
      }
      if (modeNow === "intro") {
        if ((e.key === "Enter" || e.key === " ") && (document.activeElement === body || document.activeElement === root || !document.activeElement)) { e.preventDefault(); startPower(); }
        else if ((e.key === "ArrowUp" || e.key === "PageUp") && onBackRef.current) { e.preventDefault(); onBackRef.current(); }
        return;
      }
      if (modeNow !== "story") return;
      const activation = (e.key === " " || e.key === "Enter") && (tag === "button" || tag === "a" || tag === "summary" || tgt.classList?.contains("po-gl-term"));
      if (activation) return;
      if (FWD.has(e.key)) { e.preventDefault(); takeOver(); advance(1); }
      else if (BACK.has(e.key)) { e.preventDefault(); takeOver(); advance(-1); }
    };
    const onVisibility = () => {
      if (document.hidden) audio.suspend();
      else if (modeNow !== "intro" || audio.humming) audio.resume();
    };
    // a gesture is what lets a stalled context (iOS after the app was backgrounded) start again
    const onGesture = () => audio.resume();
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted && modeNow !== "intro") audio.resume(); };
    // in the opening, scrolling or swiping forward moves to the next beat (at most one beat per gesture)
    let touchY = -1, lastWheel = 0;
    const onIntroWheel = (e: WheelEvent) => {
      if (modeNow !== "intro" || keysOpenRef.current) return;
      if (openingRef.current >= 0 && e.deltaY > 4 && e.timeStamp - lastWheel > 700) { lastWheel = e.timeStamp; nextOpeningRef.current(true); }
      else if (e.deltaY < -4) onBackRef.current?.();
    };
    const onIntroTouchStart = (e: TouchEvent) => { touchY = modeNow === "intro" ? e.touches[0].clientY : -1; };
    const onIntroTouchMove = (e: TouchEvent) => {
      if (touchY < 0 || modeNow !== "intro" || keysOpenRef.current) return;
      const dy = e.touches[0].clientY - touchY;
      if (dy < -60 && openingRef.current >= 0) { touchY = -1; nextOpeningRef.current(true); }
      else if (dy > 60) { touchY = -1; onBackRef.current?.(); }
    };
    const host = glHost.current!;
    const onHostMove = (e: PointerEvent) => { if (desk) host.style.cursor = desk.hitPower(e.clientX, e.clientY) ? "pointer" : ""; };
    const onHostClick = (e: MouseEvent) => {
      if (modeNow === "story") { takeOver(); advance(1); return; }
      if (openingRef.current >= 0) { nextOpeningRef.current(true); return; }
      if (desk?.hitPower(e.clientX, e.clientY)) startPower();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onCancel, { passive: true });
    window.addEventListener("touchstart", onCancel, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("touchend", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("wheel", onIntroWheel, { passive: true });
    window.addEventListener("touchstart", onIntroTouchStart, { passive: true });
    window.addEventListener("touchmove", onIntroTouchMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    host.addEventListener("pointermove", onHostMove);
    host.addEventListener("click", onHostClick);

    // --- entry: resume mid-story after a locale switch, or wait on the intro (the desk)
    // Consume inside the frame: StrictMode's throwaway first run cancels this rAF, so it must not clear the point.
    const boot = requestAnimationFrame(() => {
      const resume = consumeResume();
      if (resume && resume.era >= 0 && resume.era < ERAS.length) {
        audio.ensure();
        desk?.enterStory();
        const beat = Math.min(resume.beat, ERAS[resume.era].lines.length - 1);
        handOver({ era: resume.era, beat });
      }
    });

    return () => {
      alive = false;
      cancelAnimationFrame(boot);
      timers.forEach((id) => clearTimeout(id));
      scroll.cancel();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onCancel);
      window.removeEventListener("touchstart", onCancel);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchend", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("wheel", onIntroWheel);
      window.removeEventListener("touchstart", onIntroTouchStart);
      window.removeEventListener("touchmove", onIntroTouchMove);
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onHostMove);
      host.removeEventListener("click", onHostClick);
      body.classList.remove("po-body", "po-locked");
      desk?.park(); // kept for the next visit; see acquireDesk
      dioramas.dispose();
      music.dispose();
      audio.dispose();
      ctl.current = null;
    };
    // mount-only: engines are created once; props are read at boot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // locale change: repaint the 3D screens with the new text
  useEffect(() => {
    deskTextRef.current = deskText;
    ctl.current?.desk?.repaint(deskText);
  }, [deskText]);

  // autoplay: on the desk, press power after a beat; in the story, read one line at a time
  const { playing, setPlaying, speed, cycleSpeed } = autoplay;
  useEffect(() => {
    if (!playing || keysOpen) return;
    const c = ctl.current;
    if (!c) return;
    if (mode === "intro") {
      if (opening >= 0) return;
      const id = window.setTimeout(() => c.startPower(), 2600 / speed);
      return () => clearTimeout(id);
    }
    if (mode !== "story") return;
    const ms = (pos.beat < 0 ? 3200 : 4600) / speed;
    const id = window.setTimeout(() => { if (!c.advance(1)) setPlaying(false); }, ms);
    return () => clearTimeout(id);
  }, [playing, speed, mode, pos.era, pos.beat, keysOpen, setPlaying, opening]);

  // the opening plays on its own (about 4s a beat) until the reader takes over; beat 2 is the pull-back
  const nextOpening = useCallback((manual: boolean) => {
    if (manual) openingManual.current = true;
    const o = openingRef.current;
    if (o < 0) return;
    if (o < 2) { openingRef.current = o + 1; setOpening(o + 1); return; }
    // already pulling back: finish it quickly from where it is
    const p = pullRef.current;
    if (p && p.dur > 700) { const now = performance.now(), k = clamp((now - p.start) / p.dur); p.start = now - k * 700; p.dur = 700; }
  }, []);
  const nextOpeningRef = useRef(nextOpening);
  useEffect(() => { openingRef.current = opening; });
  useEffect(() => {
    if (opening < 0 || opening > 1 || openingManual.current) return;
    const id = window.setTimeout(() => nextOpening(false), opening === 0 ? 4200 : 3800);
    return () => clearTimeout(id);
  }, [opening, nextOpening]);
  useEffect(() => {
    if (opening !== 2) return;
    const p = { start: performance.now(), dur: reduce ? 0 : 5200 };
    pullRef.current = p;
    let raf = 0;
    const step = (now: number) => {
      const k = p.dur ? clamp((now - p.start) / p.dur) : 1;
      const desk = ctl.current?.desk;
      if (desk) desk.closeUp = 1 - ease(k);
      if (k < 1) raf = requestAnimationFrame(step);
      else { pullRef.current = null; openingRef.current = -1; setOpening(-1); }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [opening, reduce]);

  // music follows the era
  useEffect(() => {
    if (mode === "story" && music.started) music.era(ERAS[pos.era].n);
  }, [mode, pos.era, music]);

  const era = ERAS[pos.era];
  const line = pos.beat >= 0 ? era.lines[pos.beat] : null;
  const tr = TRANS_KEYS[Math.min(transIdx, TRANS_KEYS.length - 1)];

  const onScreenClick = (e: React.MouseEvent) => {
    if (mode !== "story") return;
    const el = e.target as Element;
    if (el.closest("a, button, input, textarea, select, label, .po-gl-term, .po-tip, [data-interactive]")) return;
    if (String(window.getSelection?.() ?? "")) return;
    autoplay.setPlaying(false);
    ctl.current?.advance(1);
  };

  const rootStyle = { "--po-beta-label": JSON.stringify(t("fx.beta")), "--po-gen-label": JSON.stringify(t("fx.generated")) } as CSSProperties;

  return (
    <PowerOnContext.Provider value={ctx}>
      <div ref={rootRef} className={"po-root" + (touch ? " po-touch" : "") + (onBack ? " po-flow" : "")} style={rootStyle} data-mode={mode}>
        <div ref={glHost} className="po-glhost" />
        <div ref={noglRef} className="po-nogl" aria-hidden="true"><div /></div>
        <div ref={trackRef} className="po-track" aria-hidden="true" />

        <Intro gone={introGone} hidden={mode === "story"} touch={touch} opening={opening} onNext={() => nextOpening(true)} onPower={() => ctl.current?.startPower()} />

        <div ref={screenRef} className="po-screen" data-era={era.n} aria-live="off" onClick={onScreenClick}>
          <EraFx n={era.n} reduce={reduce} />
          <div className="po-frame">
            <Narration pos={pos} reduce={reduce} advance={mode === "story" ? <Advance era={era.n} kind="next" touch={touch} onClick={() => { setPlaying(false); ctl.current?.advance(1); }} /> : null} />
            <Stage active={mode === "story" ? (line?.prop ?? null) : null} />
          </div>
          <TooltipLayer />
        </div>

        <div ref={transRef} className="po-trans" aria-hidden="true">
          <div className="po-box">
            <div className="po-yrs">{t(`trans.${tr}.from`)} <span>→</span> {t(`trans.${tr}.to`)}</div>
            <div className="po-cap">{t(`trans.${tr}.cap`)}</div>
          </div>
        </div>
        <div ref={finRef} className="po-fin">
          <div>
            <h2>{text.rich("fin.headline")}</h2>
            <p>{t("fin.body")}</p>
            <button className="po-hud po-again" type="button" style={{ position: "static", display: "inline-flex", fontSize: ".85rem", padding: "12px 20px" }}
              onClick={() => ctl.current?.powerOff()}>{t("fin.again")}</button>
          </div>
        </div>

        <Hud on={mode === "story"} era={pos.era} />
        <GpuNotice show={gpuOff} />
        <Controls era={mode === "story" ? era.n : 0} playing={playing} onPlay={() => setPlaying(!playing)} speed={speed} onSpeed={cycleSpeed}
          soundOn={soundOn} onSound={() => ctl.current?.toggleSound()} musicOn={musicOn} onMusic={() => ctl.current?.toggleMusic()}
          vol={vol} onVol={(v) => ctl.current?.setVolume(v)} onBeforeLocale={() => ctl.current?.beforeLocale()} />
        <Shortcuts open={keysOpen} era={era.n} intro={mode !== "story"} touch={touch} onClose={() => setKeysOpen(false)} />
      </div>
    </PowerOnContext.Provider>
  );
}
