"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import "./controls.css";

export interface ControlsProps {
  /** 0 = the landing and the 1989 desk; 1–6 = the story's eras (only the look changes) */
  era: number;
  playing: boolean;
  onPlay: () => void;
  speed: number;
  onSpeed: () => void;
  soundOn: boolean;
  onSound: () => void;
  musicOn: boolean;
  onMusic: () => void;
  /** music volume, 0..1 */
  vol: number;
  onVol: (percent: number) => void;
  /** runs before the language switch navigates (to remember the reader's place) */
  onBeforeLocale?: () => void;
}

/** The one control bar, bottom-right on every screen: autoplay, speed, sound, music, volume, language. */
export function Controls(p: ControlsProps) {
  const t = useTranslations("common.controls");
  return (
    <div className="ctl" data-era={p.era} role="group" aria-label={t("label")}>
      <button type="button" aria-pressed={p.playing} onClick={p.onPlay}>
        {p.playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
        )}
        <span className="ctl-lbl">{p.playing ? t("pause") : t("play")}</span>
      </button>
      <button type="button" className="ctl-speed" aria-label={`${t("speedAria")}: ${p.speed}×`} onClick={p.onSpeed}>
        {p.speed}×
      </button>
      <i className="ctl-sep" aria-hidden="true" />
      <button type="button" aria-pressed={p.soundOn} aria-label={t("soundAria")} onClick={p.onSound}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 9h4l5-4v14l-5-4H4z" />{p.soundOn && <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
        </svg>
        <span className="ctl-lbl">{p.soundOn ? t("soundOn") : t("soundOff")}</span>
      </button>
      <button type="button" aria-pressed={p.musicOn} aria-label={t("musicAria")} onClick={p.onMusic}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />
        </svg>
        <span className="ctl-lbl">{p.musicOn ? t("musicOn") : t("musicOff")}</span>
      </button>
      <label className="visually-hidden" htmlFor="ctl-vol">{t("volume")}</label>
      <input id="ctl-vol" className="ctl-vol" type="range" min={0} max={100} step={5} value={Math.round(p.vol * 100)}
        disabled={!p.soundOn || !p.musicOn} onChange={(e) => p.onVol(Number(e.target.value))} />
      <i className="ctl-sep" aria-hidden="true" />
      <span className="ctl-lang" onChangeCapture={p.onBeforeLocale}>
        <LanguageSwitcher className="ctl-langsw" />
      </span>
    </div>
  );
}
