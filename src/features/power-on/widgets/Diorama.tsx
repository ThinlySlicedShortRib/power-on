"use client";
import { useEffect, useRef, useState } from "react";
import { usePowerOn } from "../components/context";
import type { DioN } from "../engine/dioramas";
import { useStoryText } from "../i18n/rich";
import { DiagramSvg } from "./DiagramSvg";
import { useOnShow, useTimers } from "./util";

/** "Where it lived": a draggable 3D diorama with a request travelling through it, or an SVG diagram without WebGL. */
export function Diorama({ n, active }: { n: DioN; active: boolean }) {
  const { dioramas, reduce } = usePowerOn();
  const [gl] = useState(() => !reduce && dioramas.ok());
  return gl ? <Dio3D n={n} active={active} /> : <Diagram n={n} active={active} />;
}

function Dio3D({ n, active }: { n: DioN; active: boolean }) {
  const { t, rich } = useStoryText();
  const { dioramas } = usePowerOn();
  const [labels] = useState(() => dioramas.labels(n));
  const view = useRef<HTMLDivElement>(null), hint = useRef<HTMLDivElement>(null);
  const labelEls = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const v = view.current;
    if (!active || !v) return;
    dioramas.activate(n, v, labelEls.current);
    const id = window.setTimeout(() => { if (dioramas.isActive(n)) dioramas.send(n); }, 650);
    return () => { clearTimeout(id); dioramas.deactivate(n); };
  }, [active, n, dioramas]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    let drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest(".po-gl-term")) return;
      const o = dioramas.orbit(n);
      drag = { x: e.clientX, y: e.clientY, yaw: o.uyaw, pitch: o.pitch };
      dioramas.drag(n, true);
      if (e.pointerType !== "touch") v.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (e.pointerType === "touch" && Math.abs(dy) > Math.abs(dx) * 1.2 && Math.abs(dx) < 8) return;
      dioramas.setOrbit(n, drag.yaw + dx * 0.008, e.pointerType !== "touch" ? drag.pitch + dy * 0.003 : undefined);
      if (hint.current) hint.current.style.opacity = "0";
    };
    const up = () => { if (!drag) return; dioramas.drag(n, false); drag = null; };
    v.addEventListener("pointerdown", down); v.addEventListener("pointermove", move);
    v.addEventListener("pointerup", up); v.addEventListener("pointercancel", up); v.addEventListener("pointerleave", up);
    return () => {
      v.removeEventListener("pointerdown", down); v.removeEventListener("pointermove", move);
      v.removeEventListener("pointerup", up); v.removeEventListener("pointercancel", up); v.removeEventListener("pointerleave", up);
    };
  }, [n, dioramas]);

  return (
    <div className="po-dio">
      <div className="po-dio-view" ref={view} role="img" aria-label={t(`dio.aria.d${n}`)}>
        <div className="po-dio-labels">
          {labels.map((L, i) => (
            <div key={i} ref={(el) => { labelEls.current[i] = el; }} className={"po-dl" + (L.lat ? " po-lat" : "")}>
              <b>{rich(`dio.d${n}.${L.title}`)}</b>
              {L.sub ? <small>{rich(`dio.d${n}.${L.sub}`)}</small> : null}
            </div>
          ))}
        </div>
        <div className="po-dio-hint" ref={hint} aria-hidden="true">{t("dio.hint")}</div>
      </div>
      <div className="po-dgcap">
        <span>{rich(`dio.cap.d${n}`)}</span>
        <button className="po-btn" type="button" onClick={() => dioramas.send(n)}>{t("dio.send")}</button>
      </div>
    </div>
  );
}

function Diagram({ n, active }: { n: DioN; active: boolean }) {
  const { t, rich } = useStoryText();
  const { reduce } = usePowerOn();
  const svg = useRef<SVGSVGElement>(null);
  const playing = useRef(false);
  const timers = useTimers();
  const play = () => {
    const s = svg.current;
    const path = s?.querySelector<SVGPathElement>(".po-route"), pk = s?.querySelector<SVGCircleElement>(".po-packet");
    if (!s || !path || !pk || playing.current) return;
    const L = path.getTotalLength();
    if (reduce) { pk.classList.add("po-on"); const e = path.getPointAtLength(L); pk.setAttribute("cx", String(e.x)); pk.setAttribute("cy", String(e.y)); return; }
    const dur = Number(s.dataset.dur) || 2600, one = s.dataset.mode === "oneway", t0 = performance.now();
    playing.current = true; pk.classList.add("po-on");
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, p = one ? e : e < 0.5 ? e * 2 : 2 - e * 2;
      pk.classList.toggle("po-back", one ? k > 0.5 : e >= 0.5);
      const pt = path.getPointAtLength(p * L); pk.setAttribute("cx", String(pt.x)); pk.setAttribute("cy", String(pt.y));
      if (k < 1) timers.raf(step); else playing.current = false;
    };
    timers.raf(step);
  };
  useOnShow(active, () => { const id = window.setTimeout(play, 500); return () => clearTimeout(id); });
  return (
    <div style={{ width: "min(100%, 620px)" }}>
      <div className="po-dgwrap">
        <DiagramSvg n={n} svgRef={svg} />
        <div className="po-dgcap">
          <span>{rich("dio.fallbackCap")}</span>
          <button className="po-btn" type="button" style={{ fontSize: ".8rem", padding: "4px 10px" }} onClick={play}>{t("dio.send")}</button>
        </div>
      </div>
    </div>
  );
}
