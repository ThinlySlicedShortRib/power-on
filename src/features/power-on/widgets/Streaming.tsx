"use client";
import { useRef, useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { useTimers } from "./util";

/** Streaming SSR: the shell first, then each slow part as it's ready. */
export function Streaming() {
  const { t } = useStoryText();
  const { reduce } = usePowerOn();
  const [n, setN] = useState(-1);
  const clk = useRef<HTMLSpanElement>(null);
  const timers = useTimers();
  const run = () => {
    timers.clear(); setN(-1);
    const t0 = performance.now(), k = reduce ? 0.02 : 1;
    const tick = (now: number) => {
      const ms = now - t0;
      if (clk.current) clk.current.textContent = t("widgets.stream.ms", { ms: Math.round(ms / k) });
      if (ms < 1650 * k) timers.raf(tick);
    };
    timers.raf(tick);
    [40, 620, 900, 1500].forEach((ms, i) => timers.set(() => setN(i), ms * k));
  };
  const chunk = (i: number) => (
    <div className="po-chunk" key={"c" + i}>
      {i === 0 ? <b>{t("widgets.stream.c1")}</b> : t(`widgets.stream.c${i + 1}`)} <small style={{ color: "var(--muted)" }}>{t(`widgets.stream.c${i + 1}t`)}</small>
    </div>
  );
  const widths = ["100%", "80%", "60%"];
  return (
    <div className="po-card po-stream" style={{ width: "min(100%, 480px)" }}>
      <div className="po-bar"><span>{t("widgets.stream.bar")}</span><span className="po-clock" ref={clk}>{t("widgets.stream.ms", { ms: 0 })}</span></div>
      <div className="po-view">
        {n >= 0 ? chunk(0) : null}
        {n >= 0 ? [1, 2, 3].map((i) => (n >= i ? chunk(i) : <div className="po-sk" key={"s" + i} style={{ width: widths[i - 1] }} />)) : null}
      </div>
      <div style={{ padding: "0 14px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <small style={{ color: "var(--muted)" }}>{t("widgets.stream.caption")}</small>
        <button className="po-btn" type="button" onClick={run}>{t("widgets.stream.request")}</button>
      </div>
    </div>
  );
}
