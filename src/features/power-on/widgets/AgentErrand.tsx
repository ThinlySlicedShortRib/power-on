"use client";
import { useId, useRef, useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { useOnShow, useTimers } from "./util";

type Phase = "none" | "search" | "results" | "form" | "confirm" | "yes" | "no";
interface S { flow: number; typed: string | null; st: "idle" | "working" | "typing" | "waiting"; phase: Phase; q: number; filled: number; log: string; sel: number }
const INIT: S = { flow: 0, typed: null, st: "idle", phase: "none", q: 0, filled: 0, log: "pick", sel: -1 };

/** An AI agent runs an errand on a website, and pauses before anything irreversible. Auto-plays the first errand. */
export function AgentErrand({ active }: { active: boolean }) {
  const { t, rich } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const uid = useId();
  const [s, setS] = useState<S>(INIT);
  const [input, setInput] = useState("");
  const running = useRef(false);
  const site = useRef<HTMLDivElement>(null), ghost = useRef<SVGSVGElement>(null);
  const timers = useTimers();
  const f = (i: number, k: string) => t(`widgets.agent.f${i + 1}.${k}`);
  const patch = (p: Partial<S>) => setS((o) => ({ ...o, ...p }));
  const ghostTo = (sel: string, i = 0) => {
    const g = ghost.current, st = site.current;
    const node = st?.querySelectorAll(sel)[i];
    if (!g || !st || !node) return;
    const r = node.getBoundingClientRect(), b = st.getBoundingClientRect();
    g.style.transform = `translate(${r.left - b.left + r.width * 0.6}px,${r.top - b.top + r.height * 0.55}px)`;
  };
  const ghostShow = (o: number, x?: number) => { const g = ghost.current; if (!g) return; g.style.opacity = String(o); if (x != null) g.style.transform = `translate(${x}px,${x}px)`; };

  const run = (fi: number, typed: string | null) => {
    timers.clear();
    const k = reduce ? 0 : 1, at = (ms: number, fn: () => void) => timers.set(fn, ms * k);
    running.current = true;
    const q = f(fi, "q");
    setS({ flow: fi, typed, st: "working", phase: "search", q: 0, filled: 0, log: "intent", sel: typed ? -1 : fi });
    ghostShow(1, 12);
    at(400, () => ghostTo(".po-srch"));
    for (let i = 1; i <= q.length; i++) at(900 + i * 45, () => patch({ q: i }));
    const t1 = 900 + q.length * 45 + 300;
    at(t1, () => patch({ phase: "results", log: "reading" }));
    at(t1 + 700, () => ghostTo(".po-r.po-hit"));
    at(t1 + 1300, () => patch({ phase: "form", log: "filling" }));
    for (let i = 0; i < 3; i++) at(t1 + 1700 + i * 700, () => { patch({ filled: i + 1 }); ghostTo(".po-fv", i); });
    const t2 = t1 + 1700 + 3 * 700 + 300;
    at(t2, () => { running.current = false; patch({ st: "waiting", phase: "confirm", log: "" }); ghostShow(0.35); audio.blip(880); });
  };

  useOnShow(active, () => {
    if (running.current) return;
    timers.clear(); setInput("");
    if (reduce) { setInput(f(0, "intent")); run(0, null); return; }
    running.current = true;
    const intent = f(0, "intent");
    setS({ ...INIT, st: "typing", log: "auto", sel: 0 });
    for (let i = 1; i <= intent.length; i++) timers.set(() => setInput(intent.slice(0, i)), 350 + i * 38);
    timers.set(() => run(0, null), 350 + intent.length * 38 + 350);
    // leaving the line stops the errand (also keeps StrictMode's mount/unmount/mount from wedging `running`)
    return () => { timers.clear(); running.current = false; };
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    const low = v.toLowerCase();
    const fi = /shoe|buy|order|size/.test(low) ? 1 : /book|library|renew/.test(low) && !/table|dinner/.test(low) ? 2 : 0;
    run(fi, v);
  };
  const decide = (yes: boolean) => { patch({ phase: yes ? "yes" : "no", st: "idle" }); ghostShow(0); audio.blip(yes ? 1400 : 300); };

  const fi = s.flow;
  const logText = s.log === "pick" ? t("widgets.agent.pick") : s.log === "auto" ? t("widgets.agent.auto") : s.log === "intent" ? t("widgets.agent.intent", { intent: s.typed ?? f(fi, "intent") })
    : s.log === "reading" ? t("widgets.agent.reading") : s.log === "filling" ? t("widgets.agent.filling") : "";
  return (
    <div className="po-card po-agentw" style={{ width: "min(100%, 520px)" }}>
      <div className="po-bar"><span>{t("widgets.agent.bar")}</span><span>{t(`widgets.agent.${s.st}`)}</span></div>
      <div className="po-body">
        <div className="po-intents">
          {[0, 1, 2].map((i) => (
            <button key={i} type="button" className={"po-chip" + (s.sel === i ? " po-sel" : "")} onClick={() => run(i, null)}>{f(i, "intent")}</button>
          ))}
        </div>
        <form className="po-ask" onSubmit={submit}>
          <label className="po-sr" htmlFor={uid}>{t("widgets.agent.label")}</label>
          <input id={uid} placeholder={t("widgets.agent.placeholder")} maxLength={80} value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="po-btn" type="submit">{t("widgets.agent.go")}</button>
        </form>
        <div className="po-kcue"><span className="po-kbonly">{rich("widgets.agent.cueKb")}</span><span className="po-touchonly">{t("widgets.agent.cueTouch")}</span></div>
        <div className="po-site" ref={site}>
          <div className="po-url">{s.phase === "none" ? "—" : f(fi, "url")}</div>
          <div className="po-pane">
            {s.phase === "search" || s.phase === "results" ? (
              <>
                <div className="po-srch"><span>{f(fi, "q").slice(0, s.q)}</span></div>
                <div className="po-res">
                  {s.phase === "results" ? [t("widgets.agent.optA"), f(fi, "pick"), t("widgets.agent.optC")].map((x, i) => <div key={i} className={"po-r" + (i === 1 ? " po-hit" : "")}>{x}</div>) : null}
                </div>
              </>
            ) : null}
            {s.phase === "form" || s.phase === "confirm" || s.phase === "yes" || s.phase === "no" ? (
              <div className="po-form">
                {[1, 2, 3].map((i) => <label key={i}>{f(fi, "l" + i)}<span className="po-fv">{i <= s.filled ? f(fi, "v" + i) : ""}</span></label>)}
              </div>
            ) : null}
            {s.phase === "confirm" ? (
              <div className="po-confirm">
                <b>{f(fi, "confirm")}</b>
                <div>
                  <button className="po-btn" type="button" onClick={() => decide(true)}>{t("widgets.agent.approve")}</button>{" "}
                  <button className="po-btn po-ghostbtn" type="button" onClick={() => decide(false)}>{t("widgets.agent.cancel")}</button>
                </div>
                <small>{t("widgets.agent.pause")}</small>
              </div>
            ) : null}
            {s.phase === "yes" || s.phase === "no" ? (
              <div className="po-confirm"><b>{s.phase === "yes" ? "✓ " + f(fi, "done") : t("widgets.agent.cancelled")}</b></div>
            ) : null}
          </div>
          <svg className="po-ghost" ref={ghost} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l15 9-7 1.5L9 20z" /></svg>
        </div>
        <p className="po-log" aria-live="polite">{logText}</p>
      </div>
    </div>
  );
}
