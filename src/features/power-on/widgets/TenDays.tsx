"use client";
import { useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { Stamp, useOnShow, useTimers } from "./util";

/** JavaScript in about ten days, May 1995. */
export function TenDays({ active }: { active: boolean }) {
  const { t } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const [day, setDay] = useState(0);
  const [names, setNames] = useState(0);
  const timers = useTimers();
  const run = () => {
    timers.clear(); setDay(0); setNames(0);
    const sp = reduce ? 0 : 330;
    for (let i = 0; i < 10; i++) timers.set(() => { setDay(i + 1); audio.blip(600 + i * 40); }, i * sp);
    for (let i = 0; i < 3; i++) timers.set(() => setNames(i + 1), 10 * sp + 500 * (i + 1) * (sp ? 1 : 0));
  };
  useOnShow(active, run);
  return (
    <div className="po-card po-tenday" style={{ width: "min(100%, 470px)" }}>
      <div className="po-bar"><span>{t("widgets.tenday.bar")}</span><span>{t("widgets.tenday.day", { n: day })}</span></div>
      <div className="po-body">
        <div className="po-days">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < day ? "po-on" : ""}>{i + 1}</i>)}</div>
        <p className="po-msg">{day >= 10 ? t("widgets.tenday.end") : t("widgets.tenday.start")}</p>
        <div className="po-names">
          {[1, 2, 3].map((i) => <span key={i} className={i <= names ? "po-on" : ""}>{t(`widgets.tenday.n${i}`)}<small>{t(`widgets.tenday.d${i}`)}</small></span>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span className="po-story-cap"><Stamp /></span>
          <button className="po-btn" type="button" onClick={run}>{t("widgets.tenday.replay")}</button>
        </div>
      </div>
    </div>
  );
}
