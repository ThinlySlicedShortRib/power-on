"use client";
import { useState } from "react";
import { BLANK_SRC } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { useOnShow, useTimers } from "./util";

const COLS = ["#e74c3c", "#3498db", "#1abc9c", "#f1c40f", "#9b59b6", "#e67e22"];

/** Client-side rendering: an empty page, a spinner, then the app. */
export function BlankPage({ active }: { active: boolean }) {
  const { t } = useStoryText();
  const { reduce } = usePowerOn();
  const [phase, setPhase] = useState(0);
  const timers = useTimers();
  const run = () => {
    timers.clear(); setPhase(0);
    timers.set(() => setPhase(1), reduce ? 0 : 700);
    timers.set(() => setPhase(2), reduce ? 50 : 2600);
  };
  useOnShow(active, run);
  return (
    <div className="po-card po-mini">
      <div className="po-bar">
        <span>https://myapp.io/#!/dashboard</span>
        <button className="po-btn" type="button" style={{ padding: "2px 10px", fontSize: ".72rem", color: "#ecf0f1", borderColor: "#ecf0f1" }} onClick={run}>{t("widgets.blank.reload")}</button>
      </div>
      <div className="po-view">
        {phase === 0 ? <small style={{ color: "#bdc3c7" }}>{t("widgets.blank.empty")}</small> : null}
        {phase === 1 ? <div style={{ display: "grid", justifyItems: "center", gap: 10 }}><div className="po-spin" /><small style={{ color: "#7f8c8d" }}>{t("widgets.blank.loading")}</small></div> : null}
        {phase === 2 ? <div className="po-tiles4">{COLS.map((c, i) => <i key={c} style={{ background: c }}>{t(`widgets.blank.t${i + 1}`)}</i>)}</div> : null}
      </div>
      <div className="po-src">{BLANK_SRC}</div>
    </div>
  );
}
