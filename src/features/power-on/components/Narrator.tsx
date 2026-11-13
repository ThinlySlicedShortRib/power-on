"use client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type Ref } from "react";
import type { AppLocale } from "@/i18n/routing";
import { BUBBLE, clipFor, clipHere, eraClip, feelFor, type Clip, type ClipId } from "../content/narration";
import { clamp } from "../engine/env";
import { usePowerOn } from "./context";
import { useBubbleFollow } from "./useBubbleFollow";

// iOS Safari's own picture-in-picture API (no requestPictureInPicture there for inline video before 17)
type WebkitVideo = HTMLVideoElement & {
  webkitSupportsPresentationMode?: (m: string) => boolean;
  webkitSetPresentationMode?: (m: string) => void;
  webkitPresentationMode?: string;
};

// Clips already played in this page load (module scope: a reload clears it, a client-side locale switch keeps it).
// Each clip auto-plays once per load, so coming back to an era doesn't fire its clip again; a reload plays them anew.
const playedSet = new Set<ClipId>();
const played = () => playedSet;
const markPlayed = (id: ClipId) => { playedSet.add(id); };

function pipSupported(): boolean {
  if (typeof document === "undefined") return false;
  if (document.pictureInPictureEnabled) return true;
  const v = document.createElement("video") as WebkitVideo;
  return typeof v.webkitSupportsPresentationMode === "function" && v.webkitSupportsPresentationMode("picture-in-picture");
}

function exitPip(v: WebkitVideo | null) {
  if (!v) return;
  if (document.pictureInPictureElement === v) document.exitPictureInPicture().catch(() => {});
  else if (v.webkitPresentationMode === "picture-in-picture") v.webkitSetPresentationMode?.("inline");
}

/** point the video at the clip and play it from 0; if the browser won't allow sound yet, play muted (a gesture unmutes it) */
function load(v: HTMLVideoElement, clip: Clip, muted: boolean) {
  const src = clip.sources.find((s) => v.canPlayType(s.type)) ?? clip.sources[clip.sources.length - 1];
  v.src = src.src;
  v.volume = 1;
  v.muted = muted;
  v.play().catch((e: DOMException) => {
    if (e.name === "AbortError") return;
    if (!v.muted) { v.muted = true; v.play().catch(() => v.dispatchEvent(new Event("error"))); }
    else v.dispatchEvent(new Event("error"));
  });
}

/** the title on the eras whose frame is a window (the desk's NeXTSTEP, the CERN terminal, Windows 95); a name, not translated */
const TITLE = ["Sean", "sean", "Sean.avi", "", "", "", ""];

interface Active {
  clip: Clip; scope: string; phase: "in" | "out";
  /** holds autoplay while it's on (every play except a replay mid-era) */
  hold: boolean;
  /** bumped by each replay so the clip reloads from 0 */
  n: number;
}

export interface NarratorHandle {
  /** play the clip for where the reader is again, from the start (even with the narrator off) */
  replay: () => void;
  /**
   * The start card's choice, called inside its click: start the opening's clip now, within the gesture, so the browser
   * lets it play with sound (`sound`), or muted and staying muted (this clip only; the Sound setting decides the rest).
   */
  begin: (sound: boolean) => void;
}

export interface NarratorProps {
  /** false until the start card is answered: no clip starts on its own before that */
  ready: boolean;
  mode: "intro" | "booting" | "story";
  /** the opening shot's caption beat (0–2), or -1 on the desk */
  opening: number;
  era: number;
  beat: number;
  /** the narrator setting (the controls' and the start card's switch; the ✕ only closes the current clip) */
  on: boolean;
  soundOn: boolean;
  /** true while a clip is on (autoplay waits for it) */
  onHold: (holding: boolean) => void;
  ref?: Ref<NarratorHandle>;
}

/**
 * "Sean in a bubble" (docs/video-narration-plan.md, section 4), now a small square frame dressed as the current era:
 * one <video> that plays `intro-open` over the opening
 * shot and each era's clip on its first visit to that era's title card, once per page load, and only clips listed in
 * content/narration.ts. Pops in, shrinks away at the end, fades out when the reader leaves its era. Follows the
 * Sound toggle, ducks the music, and holds autoplay while it talks. Decorative: the video is aria-hidden; the ✕ isn't.
 * `ref.replay()` (the controls' Replay, the R key) plays the clip for where the reader is again: like a first play,
 * but it also plays with the narrator off (without turning it on), and mid-era it doesn't hold autoplay.
 */
export function Narrator({ ready, mode, opening, era, beat, on, soundOn, onHold, ref }: NarratorProps) {
  const { music, reduce, touch } = usePowerOn();
  const t = useTranslations("common.controls");
  const locale = useLocale() as AppLocale;
  const [active, setActive] = useState<Active | null>(null);
  const [pip, setPip] = useState(false);
  const [audible, setAudible] = useState(false);
  const [follow] = useState(() => !reduce && !touch && matchMedia("(hover: hover) and (pointer: fine)").matches);
  const [pipOk] = useState(pipSupported);
  const wrap = useRef<HTMLDivElement>(null);
  const vid = useRef<WebkitVideo>(null);
  const activeRef = useRef(active);
  const soundRef = useRef(soundOn);
  const fadeOut = useRef(false);
  /** the clip was started without sound from the start card: the first-gesture unmute leaves it alone */
  const quiet = useRef(false);
  /** "<clip>:<n>" already loaded and playing from begin() (inside the gesture), so the clip effect mustn't reload it */
  const primed = useRef<string | null>(null);
  useEffect(() => { activeRef.current = active; soundRef.current = soundOn; });

  const size = touch ? BUBBLE.touch : BUBBLE.desktop;
  const scope = mode === "story" ? `e${era}` : "intro";
  const want: ClipId | null = mode === "intro" && opening >= 0 ? "intro-open" : mode === "story" && beat < 0 ? eraClip(era) : null;
  const clipId = active?.clip.id;
  const phase = active?.phase;
  const nonce = active?.n;

  useBubbleFollow(wrap, { run: !!active, follow, size, feel: feelFor(clipId ?? "intro-open"), reduce });

  /** shrink away; `fade` also fades the audio (the reader left mid-clip) */
  const end = (fade: boolean) => {
    fadeOut.current = fade;
    setActive((a) => (a && a.phase === "in" ? { ...a, phase: "out" } : a));
  };
  const endRef = useRef(end);
  useEffect(() => { endRef.current = end; });

  // unmute only inside a gesture; if the browser pauses it anyway (no activation yet), go back to muted
  const setMuted = (v: HTMLVideoElement, muted: boolean) => {
    v.muted = muted;
    if (!muted) requestAnimationFrame(() => { if (v.paused && !v.ended && activeRef.current?.phase === "in") { v.muted = true; v.play().catch(() => {}); } });
  };
  const setMutedRef = useRef(setMuted);

  // start: a clip the scene asks for, available, not yet played in this page load. A short settle so scrolling past a
  // title card doesn't fire its clip.
  useEffect(() => {
    if (!ready || !on || !want || active) return;
    const clip = clipFor(want);
    if (!clip || played().has(want)) return;
    const id = window.setTimeout(() => { markPlayed(want); quiet.current = false; setActive({ clip, scope, phase: "in", hold: true, n: 0 }); }, want === "intro-open" ? 600 : 350);
    return () => clearTimeout(id);
  }, [ready, on, want, active, scope]);

  // leave: the reader moved to another era (or off the desk)
  useEffect(() => {
    if (phase === "in" && active && active.scope !== scope) endRef.current(true);
  }, [phase, active, scope]);

  // turning the narrator off ends the clip. Only the switch from on to off: a replay plays while it's already off.
  const wasOn = useRef(on);
  useEffect(() => {
    if (wasOn.current && !on && activeRef.current?.phase === "in") endRef.current(true);
    wasOn.current = on;
  }, [on]);

  // replay: from 0, popping in again; it counts as this load's play, so the automatic one doesn't follow it
  const seq = useRef(0);
  useImperativeHandle(ref, () => ({
    replay: () => {
      const clip = clipHere(mode, era);
      if (!clip) return;
      markPlayed(clip.id);
      const pop = wrap.current?.firstElementChild as HTMLElement | null;
      if (pop && activeRef.current) { pop.style.animation = "none"; void pop.offsetWidth; pop.style.animation = ""; }
      quiet.current = false;
      setActive({ clip, scope, phase: "in", hold: mode !== "story" || beat < 0, n: ++seq.current });
    },
    begin: (sound: boolean) => {
      const v = vid.current;
      const clip = want === "intro-open" ? clipFor(want) : null;
      if (!v || !on || !clip || activeRef.current || played().has(clip.id)) return;
      markPlayed(clip.id);
      quiet.current = !sound;
      const n = ++seq.current;
      primed.current = `${clip.id}:${n}`;
      load(v, clip, !sound);
      setActive({ clip, scope, phase: "in", hold: true, n });
    },
  }), [mode, era, beat, scope, want, on]);

  // the clip itself: load, play (muted if the browser insists), end on `ended`, an error, or a stall
  useEffect(() => {
    const v = vid.current;
    const clip = clipId && clipFor(clipId);
    if (!v || !clip) return;
    // begin() already loaded it and called play() inside the start card's click; it may even be playing by now
    const wasPrimed = primed.current === `${clipId}:${nonce}`;
    primed.current = null;
    let started = wasPrimed && !v.paused && v.readyState >= 3;
    const stall = window.setTimeout(() => { if (!started) endRef.current(false); }, 10000);
    const onPlaying = () => { started = true; };
    const onEnded = () => endRef.current(false);
    const sync = () => setAudible(!v.paused && !v.muted && !v.ended);
    const onPip = () => setPip(document.pictureInPictureElement === v || v.webkitPresentationMode === "picture-in-picture");
    const evs: [string, () => void][] = [["playing", onPlaying], ["ended", onEnded], ["error", onEnded], ["playing", sync], ["pause", sync], ["volumechange", sync],
      ["enterpictureinpicture", onPip], ["leavepictureinpicture", onPip], ["webkitpresentationmodechanged", onPip]];
    evs.forEach(([e, f]) => v.addEventListener(e, f));
    if (wasPrimed) sync();
    else load(v, clip, !soundRef.current);
    return () => {
      clearTimeout(stall);
      evs.forEach(([e, f]) => v.removeEventListener(e, f));
      exitPip(v);
      v.pause();
      v.removeAttribute("src");
      v.load();
      setAudible(false);
      setPip(false);
    };
    // `nonce`: a replay reloads the same clip from the start
  }, [clipId, nonce]);

  // shrinking away: fade the audio over 300 ms if it was cut short, leave PiP, then let go of the clip
  useEffect(() => {
    if (phase !== "out") return;
    const v = vid.current;
    exitPip(v);
    if (wrap.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
    let raf = 0;
    if (fadeOut.current && v && !v.muted) {
      const from = v.volume, t0 = performance.now();
      const step = (now: number) => { const k = clamp((now - t0) / 300); v.volume = from * (1 - k); if (k < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    }
    const id = window.setTimeout(() => setActive(null), 300);
    return () => { cancelAnimationFrame(raf); clearTimeout(id); };
  }, [phase]);

  // the Sound toggle mutes him too (and turning it on lifts a "without sound" start)
  useEffect(() => {
    const v = vid.current;
    if (soundOn) quiet.current = false;
    if (v && activeRef.current) setMutedRef.current(v, !soundOn);
  }, [soundOn]);

  // the first gesture (any click or key, Next, Power on) unmutes a clip that started muted, e.g. when Sound is turned on
  // from the controls after the start card was answered without it, or the browser still refused it sound
  useEffect(() => {
    const onGesture = () => {
      const v = vid.current;
      if (v && activeRef.current?.phase === "in" && v.muted && soundRef.current && !quiet.current && !v.ended) setMutedRef.current(v, false);
    };
    const evs = ["pointerup", "touchend", "keydown"] as const;
    evs.forEach((e) => window.addEventListener(e, onGesture, true));
    return () => evs.forEach((e) => window.removeEventListener(e, onGesture, true));
  }, []);

  const holding = phase === "in" && !!active?.hold;
  useEffect(() => { onHold(holding); }, [holding, onHold]);
  useEffect(() => () => onHold(false), [onHold]);

  // duck the music while he's audible
  const talking = audible && phase === "in";
  useEffect(() => { music.narrate(talking); }, [talking, music]);
  useEffect(() => () => music.narrate(false), [music]);

  const tap = !follow && pipOk;
  const enterPip = () => {
    const v = vid.current;
    if (!v || phase !== "in") return;
    if (document.pictureInPictureEnabled && v.requestPictureInPicture) v.requestPictureInPicture().catch(() => {});
    else v.webkitSetPresentationMode?.("picture-in-picture");
  };

  const caption = active?.clip.captions[locale];
  // the frame wears the era the reader is in (0 = the opening and the desk, like the control bar), restyling live
  const look = mode === "story" ? era + 1 : 0;
  return (
    <div ref={wrap} className="po-narrator" hidden={!active} data-era={look} data-phase={phase} data-pip={pip || undefined} data-tap={tap || undefined}
      style={{ "--po-narrator-size": `${size}px` } as CSSProperties}>
      <div className="po-narratorPop">
        <div className="po-narratorWin" aria-hidden="true">
          <div className="po-narratorBar"><i className="po-narratorMin" /><span>{TITLE[look]}</span><i className="po-narratorMax" /></div>
          <div className="po-narratorBub" onClick={tap ? enterPip : undefined}>
            <video ref={vid} playsInline preload="none" poster={active?.clip.poster} disablePictureInPicture={!pipOk} disableRemotePlayback>
              {caption && <track key={clipId} kind="captions" src={caption} srcLang={locale} label={locale} default />}
            </video>
          </div>
          <span className="po-narratorTag" />
        </div>
        <button type="button" className="po-narratorX" aria-label={t("narratorClose")} onClick={() => end(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>
  );
}
