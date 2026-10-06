"use client";
import { useEffect, useRef, useState } from "react";
import { NPM_PACKAGES } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { useOnShow, useTimers } from "./util";

type Row = { cls?: "po-ok" | "po-err"; text: string };

/** 22 March 2016: an 11-line package disappears and builds break worldwide. */
export function LeftPad({ active }: { active: boolean }) {
  const { t } = useStoryText();
  const { reduce } = usePowerOn();
  const [rows, setRows] = useState<Row[]>([]);
  const out = useRef<HTMLDivElement>(null);
  const timers = useTimers();
  useEffect(() => { if (out.current) out.current.scrollTop = 1e6; }, [rows]);
  const run = () => {
    timers.clear();
    setRows([{ text: "$ npm install" }]);
    const sp = reduce ? 1 : 80;
    NPM_PACKAGES.forEach((p, i) => timers.set(() => setRows((r) => [...r, { text: `+ ${p}@${1 + (i % 4)}.${i % 9}.${i}` }]), i * sp));
    timers.set(() => setRows((r) => [...r, { cls: "po-ok", text: t("widgets.npm.added") }, { text: "" }, { text: t("widgets.npm.comment") }, { text: "$ npm install" }]), NPM_PACKAGES.length * sp + 300);
    timers.set(() => setRows((r) => [...r, { cls: "po-err", text: t("widgets.npm.err1") + "\n" + t("widgets.npm.err2") }]), NPM_PACKAGES.length * sp + (reduce ? 400 : 1600));
  };
  useOnShow(active, run);
  return (
    <div className="po-card po-npm" style={{ width: "min(100%, 500px)" }}>
      <div className="po-bar">
        <span>{t("widgets.npm.bar")}</span>
        <button className="po-btn" type="button" style={{ padding: "2px 10px", fontSize: ".75rem", color: "#fff", borderColor: "#fff" }} onClick={run}>{t("widgets.npm.again")}</button>
      </div>
      <div className="po-out" ref={out}>
        {rows.map((r, i) => <span key={i} className={r.cls}>{r.text + "\n"}</span>)}
      </div>
    </div>
  );
}
