"use client";
import { useEffect, useRef, useState } from "react";
import { HAGGLE } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { Predict } from "./Predict";
import { useOnShow, useTimers } from "./util";

/** Wild guess: your agent haggles with a shop's agent (illustrative), plus prediction sliders. */
export function Haggle({ active }: { active: boolean }) {
  const { t, rich } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState<"you" | "shop" | null>(null);
  const [speed, setSpeed] = useState<"human" | "agent">("human");
  const [res, setRes] = useState<"yes" | "no" | null>(null);
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  const running = useRef(false);
  const log = useRef<HTMLDivElement>(null);
  const timers = useTimers();
  useEffect(() => { const l = log.current; if (l) l.scrollTop = l.scrollHeight; }, [shown, typing, res]);

  const play = () => {
    timers.clear(); setShown(0); setTyping(null); setRes(null);
    if (reduce) { setShown(HAGGLE.length); running.current = false; return; }
    running.current = true;
    let i = 0;
    const next = () => {
      if (i >= HAGGLE.length) { running.current = false; return; }
      const m = HAGGLE[i++], idx = i, fast = speedRef.current === "agent";
      const isMsg = m.w === "you" || m.w === "shop";
      if (isMsg) setTyping(m.w as "you" | "shop");
      const len = isMsg ? t(`widgets.haggle.m${idx}`).length : 0;
      timers.set(() => {
        setTyping(null); setShown(idx);
        audio.blip(m.w === "you" ? 980 : m.w === "shop" ? 740 : 1300);
        timers.set(next, fast ? 60 : m.w === "signed" ? 900 : 650);
      }, fast ? 40 : isMsg ? 750 + Math.min(900, len * 12) : 500);
    };
    next();
  };
  useOnShow(active, () => {
    if (!running.current) play();
    return () => { timers.clear(); running.current = false; setTyping(null); };
  });

  const total = HAGGLE.slice(0, shown).reduce((a, m) => a + (m.ms ?? 0), 0);
  const msgs = HAGGLE.slice(0, shown).map((m, i) => {
    if (m.w === "signed") return (
      <div className="po-hg-signed" key={i}><b>{rich("widgets.haggle.signedHead")}</b>{rich("widgets.haggle.signedBody")}<small>{rich("widgets.haggle.signedNote")}</small></div>
    );
    if (m.w === "notify") return (
      <div className="po-hg-notify" key={i}>
        <span className="po-bell">●</span>
        <div>
          <b>{rich("widgets.haggle.notify")}</b>
          {res ? null : (
            <div className="po-acts">
              <button className="po-btn" type="button" onClick={() => { setRes("yes"); audio.blip(1400); }}>{t("widgets.haggle.approve")}</button>{" "}
              <button className="po-btn po-ghostbtn" type="button" onClick={() => { setRes("no"); audio.blip(300); }}>{t("widgets.haggle.decline")}</button>
            </div>
          )}
          <p className="po-res">{res === "yes" ? t("widgets.haggle.approved") : res === "no" ? t("widgets.haggle.declined") : ""}</p>
        </div>
      </div>
    );
    return (
      <div className={"po-hg-msg po-" + m.w} key={i}>
        <span className="po-av">{t(m.w === "you" ? "widgets.haggle.youIni" : "widgets.haggle.shopIni")}</span>
        <div className="po-bub">
          {t(`widgets.haggle.m${i + 1}`)}
          {m.chip ? <code>{m.chip}</code> : null}
          <small>{t("widgets.haggle.delta", { ms: m.ms ?? 0 })}</small>
        </div>
      </div>
    );
  });
  return (
    <div className="po-card po-haggle" style={{ width: "min(100%, 520px)" }}>
      <div className="po-bar">
        <span>{t("widgets.haggle.bar")} <b className="po-wg">{t("widgets.haggle.wild")}</b></span>
        <span className="po-spd" role="group" aria-label={t("widgets.haggle.speedAria")}>
          {(["human", "agent"] as const).map((sp) => (
            <button key={sp} type="button" aria-pressed={speed === sp} onClick={() => { setSpeed(sp); audio.blip(900); }}>
              {t(sp === "human" ? "widgets.haggle.human" : "widgets.haggle.agentSpeed")}
            </button>
          ))}
        </span>
      </div>
      <div className="po-hg-heads">
        <span className="po-hd po-you"><i>{t("widgets.haggle.youIni")}</i>{t("widgets.haggle.you")}</span>
        <span className="po-clock">{t("widgets.haggle.clock", { ms: total })}</span>
        <span className="po-hd po-shop">{t("widgets.haggle.shop")}<i>{t("widgets.haggle.shopIni")}</i></span>
      </div>
      <div className="po-hg-log" ref={log} aria-live="polite">
        {msgs}
        {typing ? (
          <div className={"po-hg-msg po-typing po-" + typing}>
            <span className="po-av">{t(typing === "you" ? "widgets.haggle.youIni" : "widgets.haggle.shopIni")}</span>
            <div className="po-bub"><i /><i /><i /></div>
          </div>
        ) : null}
      </div>
      <div className="po-hg-foot"><button className="po-btn po-ghostbtn" type="button" onClick={play}>{t("widgets.haggle.replay")}</button></div>
      <div className="po-hg-pred"><Predict embedded /></div>
    </div>
  );
}
