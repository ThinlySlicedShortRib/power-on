"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Autoplay } from "@/features/controls/autoplay";
import { Advance } from "@/features/controls/Advance";
import { Controls } from "@/features/controls/Controls";
import { Music } from "@/features/power-on/engine/music";
import { AudioEngine } from "@/features/power-on/engine/sfx";
import { DiveAudio } from "./engine/audio";
import { collectDom, createDiveEngine, type AppBridge, type DiveEngine } from "./engine/diveEngine";
import { HOLD_AT, TOTAL, type CaptionKey } from "./engine/timeline";
import { Murmur } from "./murmur/Murmur";
import { Caption } from "./scenes/Caption";
import { CodeLayers } from "./scenes/CodeLayers";
import { Tunnel } from "./scenes/Tunnel";
import "./dive.css";

const i = (c: ReactNode) => <i>{c}</i>;
/** the landing is "today": it plays era 5's music */
const LANDING_ERA_MUSIC = 5;

/**
 * The landing: "murmur", a playable modern social app, then a scroll-driven dive through its
 * like button → code layers → the wire → a time tunnel to 1989, where Power On's desk takes over (onEnd).
 *
 * React renders structure and text. The scroll timeline is driven imperatively by the dive engine
 * (engine/diveEngine.ts) which writes styles straight to the DOM in rAF. Sound, music and volume share
 * Power On's engines and saved settings, so the control bar behaves the same across the handoff.
 */
export function Dive({ onEnd, startAtEnd = false, autoplay }: { onEnd: () => void; startAtEnd?: boolean; autoplay: Autoplay }) {
  const t = useTranslations("dive");
  const rootRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<AppBridge>(null);
  const engineRef = useRef<DiveEngine | null>(null);
  const audioRef = useRef<DiveAudio | null>(null);
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [touch] = useState(() => window.matchMedia("(hover: none)").matches);
  const [caption, setCaption] = useState<CaptionKey | null>(null);
  const [sfx] = useState(() => new AudioEngine());
  const [music] = useState(() => new Music(sfx));
  const [soundOn, setSoundOn] = useState(sfx.soundOn);
  const [musicOn, setMusicOn] = useState(music.on);
  const [vol, setVol] = useState(music.vol);
  const { playing, setPlaying, speed, cycleSpeed } = autoplay;
  const onEndRef = useRef(onEnd);
  useEffect(() => { onEndRef.current = onEnd; });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const prevRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    sfx.revive();
    const audio = new DiveAudio();
    audio.enabled = sfx.soundOn;
    audioRef.current = audio;
    // audio may only start after a user gesture
    const onGesture = () => {
      audio.ensure();
      sfx.ensure();
      if (!music.started) music.start(LANDING_ERA_MUSIC);
      music.applyLevel();
    };
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);
    const engine = createDiveEngine({
      dom: collectDom(root),
      getApp: () => appRef.current,
      audio,
      reduce,
      onCaption: setCaption,
      onAutoplay: setPlaying,
      onEnd: () => onEndRef.current(),
      startAtEnd,
    });
    engineRef.current = engine;
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      engine.destroy();
      audio.dispose();
      music.dispose();
      sfx.dispose();
      engineRef.current = null;
      audioRef.current = null;
      window.history.scrollRestoration = prevRestoration;
    };
    // mount-only: startAtEnd is read once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // the control bar drives the engine's glide
  useEffect(() => { engineRef.current?.setSpeed(speed); }, [speed]);
  useEffect(() => { engineRef.current?.setPlaying(playing); }, [playing]);

  const toggleSound = () => {
    sfx.ensure();
    sfx.setSound(!sfx.soundOn);
    setSoundOn(sfx.soundOn);
    if (audioRef.current) { audioRef.current.enabled = sfx.soundOn; if (sfx.soundOn) audioRef.current.ensure(); }
    music.applyLevel();
  };
  const toggleMusic = () => {
    sfx.ensure();
    music.setOn(!music.on);
    setMusicOn(music.on);
    if (music.on && !music.started) music.start(LANDING_ERA_MUSIC);
    music.applyLevel();
  };

  return (
    <div className="dive-root" data-mode="play" ref={rootRef}>
      <div className="prog" aria-hidden="true">
        <div className="fill" />
        {HOLD_AT.map((h) => (
          <i key={h} className="tk" style={{ left: `${(h / TOTAL) * 100}%` }} />
        ))}
      </div>
      <Controls era={0} playing={playing} onPlay={() => setPlaying(!playing)} speed={speed} onSpeed={cycleSpeed}
        soundOn={soundOn} onSound={toggleSound} musicOn={musicOn} onMusic={toggleMusic} vol={vol}
        onVol={(v) => { music.setVolume(v); setVol(music.vol); }} />

      <div className="track">
        <div className="stage">
          {/* scene 1: copy on the left, the app on the right (stacked on narrow screens) */}
          <section className="scene s-app" aria-label={t("title.sceneLabel")}>
            <header className="titlebar">
              <h1>{t.rich("title.headline", { i })}</h1>
              <p>{t("title.sub")}</p>
              <Advance era={0} kind="start" touch={touch} onClick={() => engineRef.current?.showMe()} />
            </header>
            <div className="browser">
              <Murmur ref={appRef} reduce={reduce} />
            </div>
          </section>

          <CodeLayers />
          <Tunnel />
          <div className="year">2026</div>
        </div>
      </div>
      <Caption value={caption} reduce={reduce}>
        <Advance era={0} kind="next" touch={touch} onClick={() => { setPlaying(false); engineRef.current?.next(); }} />
      </Caption>
    </div>
  );
}
