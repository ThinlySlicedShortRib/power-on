"use client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ERAS } from "../content/eras";
import { useStoryText } from "../i18n/rich";

export interface HudProps {
  on: boolean; era: number; soundOn: boolean; musicOn: boolean; vol: number; touch: boolean;
  onSound: () => void; onMusic: () => void; onVol: (v: number) => void; onKeys: () => void; onBeforeLocale: () => void;
}

export function Hud(p: HudProps) {
  const { t } = useStoryText();
  const era = ERAS[p.era];
  return (
    <>
      <div className={"po-hud po-hudEra" + (p.on ? " po-on" : "")} aria-hidden="true">
        <span className="po-yr">{t(`eras.${era.key}.span`)}</span>
        <span className="po-hudName">{t(`eras.${era.key}.name`)}</span>
        <span className="po-pips">{ERAS.map((_, i) => <i key={i} className={i <= p.era ? "po-on" : ""} />)}</span>
      </div>
      <div className="po-hud po-audioctl" data-era={era.n}>
        <button className="po-sound" type="button" aria-pressed={p.soundOn} aria-label={t("hud.soundAria")} onClick={p.onSound}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" /><path className="po-w" d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
          </svg>
          <span className="po-soundLbl">{p.soundOn ? t("hud.soundOn") : t("hud.soundOff")}</span>
        </button>
        <button className={"po-music" + (!p.musicOn || !p.soundOn ? " po-off" : "")} type="button" aria-pressed={p.musicOn} aria-label={t("hud.musicAria")} onClick={p.onMusic}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />
          </svg>
          <span className="po-musicLbl">{p.musicOn ? t("hud.musicOn") : t("hud.musicOff")}</span>
        </button>
        {p.touch ? null : <button className="po-keysBtn" type="button" aria-label={t("hud.keysAria")} aria-haspopup="dialog" onClick={p.onKeys}>?</button>}
        <label className="po-sr" htmlFor="po-mvol">{t("hud.volume")}</label>
        <input className="po-mvol" id="po-mvol" type="range" min={0} max={100} step={5} value={Math.round(p.vol * 100)} disabled={!p.soundOn || !p.musicOn}
          onChange={(e) => p.onVol(Number(e.target.value))} />
        <span className="po-lang" onChangeCapture={p.onBeforeLocale}>
          <LanguageSwitcher className="po-langsw" />
        </span>
      </div>
    </>
  );
}
