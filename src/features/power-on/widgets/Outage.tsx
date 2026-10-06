"use client";
import { useState } from "react";
import { OUTAGE_CMD, OUTAGE_TYPO } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { Stamp, useOnShow, useTimers } from "./util";

const SITES = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12"];

/** 28 Feb 2017: one mistyped command takes S3 in us-east-1 down, and the dominoes fall. */
export function Outage({ active }: { active: boolean }) {
  const { t, rich } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState(0); // 0 idle/typing · 1 typo + going down · 2 done
  const [dead, setDead] = useState(0);
  const timers = useTimers();
  const reset = () => { timers.clear(); setTyped(0); setPhase(0); setDead(0); };
  useOnShow(active, reset);
  const run = () => {
    if (phase === 2) { reset(); return; }
    reset();
    const k = reduce ? 0 : 1, L = OUTAGE_CMD.length;
    for (let i = 0; i <= L; i++) timers.set(() => setTyped(i), i * 28 * k);
    timers.set(() => { setPhase(1); audio.blip(220); }, (L * 28 + 300) * k);
    SITES.forEach((_, i) => timers.set(() => { setDead(i + 1); audio.blip(160 + i * 10); }, (L * 28 + 900 + i * 170) * k));
    timers.set(() => setPhase(2), (L * 28 + 900 + SITES.length * 170 + 300) * k);
  };
  return (
    <div className="po-card po-outage" style={{ width: "min(100%, 500px)" }}>
      <div className="po-bar"><span>{t("widgets.outage.bar")}</span><span>{t("widgets.outage.date")}</span></div>
      <div className="po-out">
        $ <span>{OUTAGE_CMD.slice(0, typed)}</span>{phase >= 1 ? <mark>{OUTAGE_TYPO}</mark> : null}
        {phase >= 1 ? <>{"\n"}<b>{t("widgets.outage.removing")}</b>{t("widgets.outage.going")}</> : null}
        {phase >= 2 ? <>{"\n"}<i>{t("widgets.outage.lie")}</i>{"\n"}<b className="po-ok">{t("widgets.outage.later")}</b></> : null}
      </div>
      <div className="po-sites">
        {SITES.map((s, i) => <span key={s} className={i < dead ? (s === "s12" ? "po-lie" : "po-dead") : ""}>{t(`widgets.outage.${s}`)}</span>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "0 14px 14px" }}>
        <span className="po-story-cap"><Stamp /> {rich("widgets.outage.caption")}</span>
        <button className="po-btn" type="button" onClick={run}>{phase === 2 ? t("widgets.outage.restore") : t("widgets.outage.run")}</button>
      </div>
    </div>
  );
}
