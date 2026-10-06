"use client";
import { useEffect, useRef } from "react";
import { useStoryText } from "../i18n/rich";

/** Per-era decoration behind the frame: marquee, gloss header, flat nav, mesh, the future's wandering agent. */
export function EraFx({ n, reduce }: { n: number; reduce: boolean }) {
  const { t } = useStoryText();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (n !== 6 || reduce || !el) return;
    const step = () => {
      const g = el.querySelector<HTMLElement>(".po-agentcur");
      if (g) g.style.transform = `translate(${10 + Math.random() * 75}vw,${15 + Math.random() * 65}vh)`;
      el.querySelectorAll<HTMLElement>(".po-gblk").forEach((b) => {
        b.style.left = Math.random() * 80 + "%"; b.style.top = Math.random() * 80 + "%";
        b.style.width = 8 + Math.random() * 18 + "%"; b.style.height = 6 + Math.random() * 14 + "%";
      });
    };
    step();
    const id = window.setInterval(step, 3200);
    return () => clearInterval(id);
  }, [n, reduce]);
  return (
    <div className="po-fx" ref={box} aria-hidden="true">
      {n === 2 ? <><div className="po-marquee"><span>{t("fx.marquee")}</span></div><div className="po-uc" /></> : null}
      {n === 3 ? <><div className="po-gloss-top"><b>{t("fx.glossLogo")}</b></div><div className="po-starburst">{t("fx.starburst")}</div></> : null}
      {n === 4 ? <><div className="po-flatnav"><i />{t("fx.flatLogo")}</div><div className="po-longshadow po-ls1">✓</div></> : null}
      {n === 5 ? <div className="po-mesh" /> : null}
      {n === 6 ? (
        <>
          <div className="po-gblk" /><div className="po-gblk" /><div className="po-gblk" /><div className="po-gblk" /><div className="po-gblk" />
          <div className="po-intentbar"><span className="po-spark">✦</span><span className="po-ph">{t("fx.intent")}</span></div>
          <div className="po-think" />
          <div className="po-agentcur"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l15 9-7 1.5L9 20z" /></svg><span>{t("fx.agent")}</span></div>
        </>
      ) : null}
    </div>
  );
}
