"use client";
import { useRef, useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { Stamp, useOnShow, useTimers } from "./util";

/** 1 April 2004: 1 GB, when rivals offered a few MB. */
export function Gmail({ active }: { active: boolean }) {
  const { t, rich } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const grow = useRef<HTMLElement>(null), mb = useRef<HTMLElement>(null);
  const [ans, setAns] = useState(false);
  const timers = useTimers();
  useOnShow(active, () => {
    timers.clear(); setAns(false);
    const t0 = performance.now(), D = reduce ? 1 : 2400;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      if (grow.current) grow.current.style.width = e * 100 + "%";
      if (mb.current) mb.current.textContent = t("widgets.gmail.mb", { mb: Math.round(e * 1000).toLocaleString() });
      if (k < 1) timers.raf(step);
    };
    timers.raf(step);
  });
  return (
    <div className="po-card po-gmail" style={{ width: "min(100%, 480px)" }}>
      <div className="po-bar"><span>{t("widgets.gmail.bar")} <sup>{t("widgets.gmail.beta")}</sup> {t("widgets.gmail.invite")}</span><span>{t("widgets.gmail.date")}</span></div>
      <div className="po-body">
        <div className="po-meters">
          <div><span>{t("widgets.gmail.rival")}</span><b style={{ "--w": ".4%" } as React.CSSProperties} /><em>{t("widgets.gmail.rivalMb")}</em></div>
          <div className="po-big"><span>{t("widgets.gmail.gmail")}</span><b ref={grow} /><em ref={mb}>{t("widgets.gmail.mb", { mb: 0 })}</em></div>
        </div>
        <div className="po-joke">
          <span>{rich("widgets.gmail.joke")}</span>
          <button className="po-btn" type="button" onClick={() => { setAns(true); audio.blip(1100); }}>{t("widgets.gmail.ask")}</button>
        </div>
        <p className="po-ans" aria-live="polite">{ans ? t("widgets.gmail.answer") : ""}</p>
        <div className="po-story-cap"><Stamp /></div>
      </div>
    </div>
  );
}
