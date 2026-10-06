"use client";
import { useState } from "react";
import { GENUI_DATA } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { useOnShow, useTimers } from "./util";

type V = "sr" | "kid" | "exec";

/** Same data, a different interface generated for each visitor. */
export function GenUI({ active }: { active: boolean }) {
  const { t } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const [v, setV] = useState<V>("sr");
  const [ready, setReady] = useState(false);
  const timers = useTimers();
  const gen = (k: V) => { timers.clear(); setV(k); setReady(false); timers.set(() => setReady(true), reduce ? 0 : 700); };
  useOnShow(active, () => gen("sr"));
  const g = (k: string) => t(`widgets.genui.${k}`);
  return (
    <div className="po-card po-genui" style={{ width: "min(100%, 500px)" }}>
      <div className="po-bar"><span>{g("bar")}</span><span>{ready ? g("ready") : g("generating")}</span></div>
      <div className="po-vt" role="tablist">
        {([["sr", "tSr"], ["kid", "tKid"], ["exec", "tExec"]] as [V, string][]).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={v === k} onClick={() => { gen(k); audio.blip(1000); }}>{g(l)}</button>
        ))}
      </div>
      <div className="po-body po-gbody" role="tabpanel">
        {!ready ? <><div className="po-sk" /><div className="po-sk" style={{ width: "70%" }} /></> : v === "sr" ? (
          <div className="po-g-sr"><p className="po-say">{g("srSay")}</p><ol><li>{g("sr1")}</li><li>{g("sr2")}</li><li>{g("sr3")}</li></ol></div>
        ) : v === "kid" ? (
          <div className="po-g-kid"><b>{g("kidHead")}</b><p>{g("kidText")}</p><div className="po-big">{g("kidBig")}</div></div>
        ) : (
          <div className="po-g-exec"><b>{g("execHead")}</b><div><button className="po-btn" type="button" tabIndex={-1}>{g("execCar")}</button> <button className="po-btn po-ghostbtn" type="button" tabIndex={-1}>{g("execCheck")}</button></div></div>
        )}
      </div>
      <div className="po-data"><code>{GENUI_DATA}</code> <small>{g("illustrative")}</small></div>
    </div>
  );
}
