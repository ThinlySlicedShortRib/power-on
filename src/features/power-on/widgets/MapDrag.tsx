"use client";
import { useEffect, useRef } from "react";
import { clamp } from "../engine/env";
import { useStoryText } from "../i18n/rich";

const W = 1200, H = 420;
function land(x: number, y: number) {
  return Math.sin(x * 0.011) * Math.cos(y * 0.017) + Math.sin(x * 0.023 + 1.3) * 0.6 + Math.cos(y * 0.009 + x * 0.004) * 0.7 + Math.sin((x + y) * 0.031) * 0.25;
}

/** Google Maps, 2005: drag the planet around. */
export function MapDrag() {
  const { t } = useStoryText();
  const tiles = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tiles.current;
    if (!el) return;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#a9d3f5"; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) { const v = land(x, y); if (v > 0.55) { g.fillStyle = v > 1.4 ? "#c9b98a" : v > 1.0 ? "#9cc47a" : "#b8d99a"; g.fillRect(x, y, 4, 4); } }
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1;
    for (let q = 0; q <= W; q += 150) { g.beginPath(); g.moveTo(q, 0); g.lineTo(q, H); g.stroke(); }
    for (let q = 0; q <= H; q += 150) { g.beginPath(); g.moveTo(0, q); g.lineTo(W, q); g.stroke(); }
    g.strokeStyle = "#f2b84b"; g.lineWidth = 3; g.beginPath(); g.moveTo(80, 300); g.bezierCurveTo(300, 120, 600, 380, 1100, 160); g.stroke();
    el.style.backgroundImage = "url(" + cv.toDataURL() + ")";
    let ox = -200, oy = -60, drag: { x: number; y: number; ox: number; oy: number } | null = null;
    const put = () => { oy = clamp(oy, -(H - el.clientHeight), 0); el.style.backgroundPosition = ox + "px " + oy + "px"; };
    put();
    const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, ox, oy }; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (!drag) return; ox = drag.ox + e.clientX - drag.x; oy = drag.oy + e.clientY - drag.y; put(); };
    const up = () => { drag = null; };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    return () => { el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); };
  }, []);
  return (
    <div className="po-card po-map">
      <div className="po-bar"><span>{t("widgets.map.bar")} <sup>{t("widgets.map.beta")}</sup></span><span>{t("widgets.map.hint")}</span></div>
      <div className="po-tiles" ref={tiles} role="img" aria-label={t("widgets.map.aria")}><div className="po-pin" /></div>
    </div>
  );
}
