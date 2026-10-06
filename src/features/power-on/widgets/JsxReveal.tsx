"use client";
import { useState } from "react";
import { JSX_SAMPLE } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { Stamp, useTimers } from "./util";

/** JSConf US 2013: React's debut, and the room's reaction. */
export function JsxReveal() {
  const { t, rich } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const [n, setN] = useState(0);
  const timers = useTimers();
  const hear = () => {
    timers.clear(); setN(0);
    for (let i = 0; i < 6; i++) timers.set(() => { setN(i + 1); audio.blip(i >= 4 ? 1200 : 420); }, (reduce ? 0 : 520) * i);
  };
  return (
    <div className="po-card po-jsx" style={{ width: "min(100%, 480px)" }}>
      <div className="po-bar"><span>{t("widgets.jsx.bar")}</span><span>{t("widgets.jsx.tag")}</span></div>
      <div className="po-body">
        <pre>{JSX_SAMPLE}</pre>
        <div className="po-bubbles" aria-live="polite">
          {Array.from({ length: n }, (_, i) => <span key={i} className={i >= 4 ? "po-pos" : ""}>{t(`widgets.jsx.r${i + 1}`)}</span>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span className="po-story-cap"><Stamp /> {rich("widgets.jsx.caption")}</span>
          <button className="po-btn" type="button" onClick={hear}>{t("widgets.jsx.hear")}</button>
        </div>
      </div>
    </div>
  );
}
