"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DiveAudio } from "./engine/audio";
import { collectDom, createDiveEngine, type AppBridge, type DiveEngine } from "./engine/diveEngine";
import { HOLD_AT, TOTAL, type CaptionKey } from "./engine/timeline";
import { Murmur } from "./murmur/Murmur";
import { Caption } from "./scenes/Caption";
import { CodeLayers } from "./scenes/CodeLayers";
import { Tunnel } from "./scenes/Tunnel";
import "./dive.css";

const SOUND_KEY = "dive.sound.v1";
const i = (c: ReactNode) => <i>{c}</i>;
const kbd = (c: ReactNode) => <kbd>{c}</kbd>;

function readSound() {
  try {
    return window.localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * The landing: "murmur", a playable modern social app, then a scroll-driven dive through its
 * like button → code layers → the wire → a time tunnel to 1989, where Power On's desk takes over (onEnd).
 *
 * React renders structure and text. The scroll timeline is driven imperatively by the dive engine
 * (engine/diveEngine.ts) which writes styles straight to the DOM in rAF.
 */
export function Dive({ onEnd, startAtEnd = false }: { onEnd: () => void; startAtEnd?: boolean }) {
  const t = useTranslations("dive");
  const rootRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<AppBridge>(null);
  const engineRef = useRef<DiveEngine | null>(null);
  const audioRef = useRef<DiveAudio | null>(null);
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [touch] = useState(() => window.matchMedia("(hover: none)").matches);
  const [caption, setCaption] = useState<CaptionKey | null>(null);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(readSound);
  const onEndRef = useRef(onEnd);
  useEffect(() => { onEndRef.current = onEnd; });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const prevRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const audio = new DiveAudio();
    audioRef.current = audio;
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
      engine.destroy();
      audio.dispose();
      engineRef.current = null;
      audioRef.current = null;
      window.history.scrollRestoration = prevRestoration;
    };
    // mount-only: startAtEnd is read once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.enabled = sound;
  }, [sound]);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try {
      window.localStorage.setItem(SOUND_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next) audioRef.current?.ensure();
  };

  return (
    <div className="dive-root" data-mode="play" ref={rootRef}>
      <div className="prog" aria-hidden="true">
        <div className="fill" />
        {HOLD_AT.map((h) => (
          <i key={h} className="tk" style={{ left: `${(h / TOTAL) * 100}%` }} />
        ))}
      </div>
      <div className="hint">
        {touch ? (
          <span>{t("hint.touch")}</span>
        ) : (
          <>
            <span className="long">{t("hint.scroll")}</span>
            <kbd>{t("hint.space")}</kbd>
            <span>{t("hint.next")}</span>
          </>
        )}
      </div>
      <div className="hud" role="group" aria-label={t("hud.label")}>
        <button type="button" aria-pressed={playing} onClick={() => engineRef.current?.toggleAutoplay()}>
          {playing ? t("hud.pause") : t("hud.play")}
        </button>
        <button type="button" aria-pressed={sound} onClick={toggleSound}>
          {sound ? t("hud.soundOn") : t("hud.soundOff")}
        </button>
        <LanguageSwitcher className="langsw" />
      </div>

      <div className="track">
        <div className="stage">
          {/* scene 1: title + modern app */}
          {/* copy on the left, the app on the right (stacked on narrow screens) */}
          <section className="scene s-app" aria-label={t("title.sceneLabel")}>
            <header className="titlebar">
              <h1>{t.rich("title.headline", { i })}</h1>
              <p>{t("title.sub")}</p>
              <div className="tgo">
                <button className="showme" type="button" onClick={() => engineRef.current?.showMe()}>
                  {t("title.showMe")}
                </button>
                {!touch && <span className="kb">{t.rich("title.orPress", { kbd })}</span>}
              </div>
              <div className="cue">
                <span>{t("cue")}</span>
                <span className="arr">↓</span>
              </div>
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
      <Caption value={caption} reduce={reduce} />
    </div>
  );
}
