"use client";
import { useEffect, useRef } from "react";
import { useStoryText } from "../i18n/rich";
import { usePowerOn } from "../components/context";
import { useOnShow, useTimers } from "./util";

function paintSunset(): HTMLCanvasElement {
  const img = document.createElement("canvas"); img.width = 160; img.height = 100;
  const h = img.getContext("2d")!;
  const sky = h.createLinearGradient(0, 0, 0, 70); sky.addColorStop(0, "#2a1a6e"); sky.addColorStop(0.6, "#ff5e7e"); sky.addColorStop(1, "#ffcf5a"); h.fillStyle = sky; h.fillRect(0, 0, 160, 70);
  h.fillStyle = "#ffef9a"; h.beginPath(); h.arc(80, 66, 18, 0, 7); h.fill();
  h.fillStyle = "#1b1446"; h.beginPath(); h.moveTo(0, 70); for (let x = 0; x <= 160; x += 10) h.lineTo(x, 52 + Math.sin(x * 0.09) * 9 + (x % 30 ? 0 : -6)); h.lineTo(160, 70); h.fill();
  h.fillStyle = "#0e3a6e"; h.fillRect(0, 70, 160, 30); h.fillStyle = "#ffcf5a"; for (let y = 72; y < 100; y += 4) h.fillRect(80 - (y - 66) * 0.6, y, (y - 66) * 1.2, 1);
  return img;
}

/** 100 KB at 28.8k: the picture arrives a line at a time. */
export function SlowImage({ active }: { active: boolean }) {
  const { t } = useStoryText();
  const { reduce } = usePowerOn();
  const cv = useRef<HTMLCanvasElement>(null), bar = useRef<HTMLElement>(null), tl = useRef<HTMLSpanElement>(null);
  const img = useRef<HTMLCanvasElement | null>(null);
  const timers = useTimers();
  useEffect(() => { img.current = paintSunset(); }, []);
  const run = () => {
    timers.clear();
    const g = cv.current?.getContext("2d");
    if (!g) return;
    if (!img.current) img.current = paintSunset();
    g.fillStyle = "#c0c0c0"; g.fillRect(0, 0, 160, 100);
    const t0 = performance.now(), D = reduce ? 10 : 6950;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / D), rows = Math.floor(k * 100);
      if (rows > 0) g.drawImage(img.current!, 0, 0, 160, rows, 0, 0, 160, rows);
      if (bar.current) bar.current.style.width = k * 100 + "%";
      if (tl.current) tl.current.textContent = t("widgets.slow.secs", { s: (k * 27.8).toFixed(1) });
      if (k < 1) timers.raf(step);
    };
    timers.raf(step);
  };
  useOnShow(active, run);
  return (
    <div className="po-card po-slow" style={{ width: "min(100%, 440px)" }}>
      <div className="po-bar"><span>{t("widgets.slow.bar")}</span><span ref={tl}>{t("widgets.slow.secs", { s: "0.0" })}</span></div>
      <div className="po-body">
        <canvas ref={cv} width={160} height={100} role="img" aria-label={t("widgets.slow.aria")} />
        <div className="po-meter"><b ref={bar} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <small>{t("widgets.slow.note")}</small>
          <button className="po-btn" type="button" onClick={run}>{t("widgets.slow.reload")}</button>
        </div>
      </div>
    </div>
  );
}
