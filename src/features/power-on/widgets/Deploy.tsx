"use client";
import { useEffect, useRef, useState } from "react";
import { DEPLOY_GIT, DEPLOY_URL } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { useTimers } from "./util";

/** git push → live in every region. */
export function Deploy() {
  const { t } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const cities = t("widgets.deploy.cities").split("\n");
  const [lines, setLines] = useState<string[] | null>(null);
  const [on, setOn] = useState(0);
  const [ready, setReady] = useState(false);
  const out = useRef<HTMLDivElement>(null);
  const timers = useTimers();
  useEffect(() => { if (out.current) out.current.scrollTop = 1e6; }, [lines, ready]);
  const push = () => {
    timers.clear(); setOn(0); setReady(false); setLines([]);
    const k = reduce ? 0.05 : 1;
    const seq: [number, string][] = [[0, DEPLOY_GIT[0]], [350, DEPLOY_GIT[1]], [700, t("widgets.deploy.l3")], [1300, t("widgets.deploy.l4")], [2300, t("widgets.deploy.l5")], [3000, t("widgets.deploy.l6")]];
    seq.forEach(([ms, s]) => timers.set(() => { setLines((l) => [...(l ?? []), s]); audio.blip(520 + ms / 10); }, ms * k));
    cities.forEach((_, i) => timers.set(() => setOn(i + 1), (3100 + i * 110) * k));
    timers.set(() => { setReady(true); audio.blip(1760); }, (3200 + cities.length * 110) * k);
  };
  return (
    <div className="po-card po-deploy" style={{ width: "min(100%, 500px)" }}>
      <div className="po-bar"><span>{t("widgets.deploy.bar")}</span><span>{t("widgets.deploy.tag")}</span></div>
      <div className="po-out" ref={out} aria-live="polite">
        {lines === null ? t("widgets.deploy.prompt") : lines.join("\n") + "\n"}
        {ready ? <><b>{t("widgets.deploy.ready", { n: cities.length })}</b>{"\n" + DEPLOY_URL}</> : null}
      </div>
      <div className="po-cities">{cities.map((c, i) => <span key={c} className={i < on ? "po-on" : ""}>{c}</span>)}</div>
      <div style={{ padding: "0 14px 14px", display: "flex", justifyContent: "flex-end" }}>
        <button className="po-btn" type="button" onClick={push}>{t("widgets.deploy.push")}</button>
      </div>
    </div>
  );
}
