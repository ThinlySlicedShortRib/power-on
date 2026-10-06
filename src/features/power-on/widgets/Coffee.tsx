"use client";
import { useRef, useState } from "react";
import { usePowerOn } from "../components/context";
import { clamp } from "../engine/env";
import { useStoryText } from "../i18n/rich";
import { Stamp, useOnShow } from "./util";

/** The Trojan Room coffee pot: grainy grey stills, refreshed every few seconds. */
export function Coffee({ active }: { active: boolean }) {
  const { t, rich } = useStoryText();
  const { audio, reduce } = usePowerOn();
  const cv = useRef<HTMLCanvasElement>(null);
  const level = useRef(0.7);
  const [info, setInfo] = useState<{ ts: string; lvl: number } | null>(null);

  const frame = () => {
    const g = cv.current?.getContext("2d");
    if (!g) return;
    level.current = Math.random() < 0.25 ? 0 : clamp(level.current + (Math.random() - 0.6) * 0.35, 0.05, 0.95);
    const L = level.current, img = g.createImageData(128, 128), d = img.data;
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      let v = 70 + y * 0.35;
      if (y > 100) v = 45;
      if (y > 92 && y < 102 && x > 30 && x < 98) v = 25;
      const cx = 64, top = 34, bot = 94, half = 18 + (y - top) * 0.28;
      if (y >= top && y <= bot && Math.abs(x - cx) < half) { v = 150; const lvlY = bot - (bot - top) * L; if (y > lvlY) v = 30; if (Math.abs(Math.abs(x - cx) - half) < 1.5) v = 210; }
      if (y > 24 && y < 34 && Math.abs(x - cx) < 14) v = 60;
      if (x > 84 + (y - 40) * 0.05 && x < 92 && y > 44 && y < 80 && (x < 86 || y < 47 || y > 77)) v = 55;
      v += (Math.random() - 0.5) * 46;
      const i = (y * 128 + x) * 4; d[i] = d[i + 1] = d[i + 2] = clamp(v, 0, 255); d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    setInfo({ ts: new Date().toTimeString().slice(0, 8), lvl: L });
  };

  useOnShow(active, () => {
    frame();
    if (reduce) return;
    const id = window.setInterval(frame, 3500);
    return () => clearInterval(id);
  });

  const lvl = info?.lvl;
  const msg = lvl == null ? t("widgets.coffee.checking") : lvl === 0 ? t("widgets.coffee.empty") : lvl < 0.3 ? t("widgets.coffee.low") : t("widgets.coffee.level", { pct: Math.round(lvl * 100) });
  return (
    <div className="po-card po-coffee" style={{ width: "min(100%, 400px)" }}>
      <div className="po-bar"><span>{t("widgets.coffee.bar")}</span><span className="po-ts">{info?.ts ?? "--:--:--"}</span></div>
      <div className="po-body">
        <canvas ref={cv} width={128} height={128} role="img" aria-label={t("widgets.coffee.aria")} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span className="po-lvl">{msg}</span>
          <button className="po-btn" type="button" onClick={() => { frame(); audio.blip(740); }}>{t("widgets.coffee.refresh")}</button>
        </div>
        <div className="po-story-cap"><Stamp /> {rich("widgets.coffee.caption")}</div>
      </div>
    </div>
  );
}
