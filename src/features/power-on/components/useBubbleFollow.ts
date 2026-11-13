"use client";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { BUBBLE, type Feel } from "../content/narration";
import { clamp } from "../engine/env";

/** what the bubble must never cover: the control bar, the era badge and its open list */
const OBSTACLES = [".ctl", ".po-hudEra.po-on .po-hudBtn", ".po-hudEra.po-open .po-eras"];

interface Box { l: number; t: number; r: number; b: number }
const overlaps = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
const near = (px: number, py: number, x: number, y: number, w: number, h: number, pad: number) => px > x - pad && px < x + w + pad && py > y - pad && py < y + h + pad;

/**
 * Places the narrator frame while `run` is on, writing only `transform` from one rAF loop. The frame is the video
 * (`size` square) plus the era's chrome (title bar, bevel), so its real box is measured, and re-measured as it changes.
 * `follow` (fine pointer, no reduced motion): trails the mouse down and away from it, with the clip's era feel, flipping
 * sides near the edges and hopping over the controls. It holds still when you reach for it, so the ✕ can be clicked.
 * Otherwise (touch, reduced motion, or before the mouse has moved) it docks bottom-right above the controls.
 */
export function useBubbleFollow(ref: RefObject<HTMLElement | null>, { run, follow, size, feel, reduce }: {
  run: boolean; follow: boolean; size: number; feel: Feel; reduce: boolean;
}) {
  const ptr = useRef({ x: 0, y: 0, vx: 0, vy: 0, t: 0, has: false });

  // the mouse, tracked all along so the bubble can appear next to it
  useEffect(() => {
    if (!follow) return;
    const p = ptr.current;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const dt = (e.timeStamp - p.t) / 1000;
      if (p.has && dt > 0 && dt < 0.1) { p.vx += ((e.clientX - p.x) / dt - p.vx) * 0.3; p.vy += ((e.clientY - p.y) / dt - p.vy) * 0.3; }
      else { p.vx = p.vy = 0; }
      p.x = e.clientX; p.y = e.clientY; p.t = e.timeStamp; p.has = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [follow]);

  // layout effect: the first position is written before the bubble paints
  useLayoutEffect(() => {
    const el = ref.current;
    if (!run || !el) return;
    const root = el.closest(".po-root") ?? document.body;
    const p = ptr.current, { offset: o, margin: m, gap } = BUBBLE;
    const side = { h: 1, v: 1 };
    let raf = 0, last = 0, x = NaN, y = NaN, acc = 0, moving = 0, frozen = false;
    // the frame's layout box (the pop animation's scale doesn't change it); a ResizeObserver follows era restyles
    let w = el.offsetWidth || size, h = el.offsetHeight || size;
    const ro = new ResizeObserver(() => { w = el.offsetWidth || size; h = el.offsetHeight || size; });
    ro.observe(el);

    const obstacles = (): Box[] => OBSTACLES.flatMap((sel) => {
      const n = root.querySelector(sel);
      const r = n?.getBoundingClientRect();
      return r && r.width && r.height ? [{ l: r.left - gap, t: r.top - gap, r: r.right + gap, b: r.bottom + gap }] : [];
    });

    // bottom-right, standing on whatever is below it (the control bar)
    const dock = (obs: Box[]) => {
      const tx = innerWidth - m - w;
      let floor = innerHeight - m;
      for (const r of obs) if (r.l < tx + w && r.r > tx && r.b > innerHeight / 2) floor = Math.min(floor, r.t);
      return { x: tx, y: floor - h };
    };

    const aim = (obs: Box[]) => {
      const W = innerWidth, H = innerHeight;
      let px = p.x, py = p.y;
      if (feel.lead) { const lx = p.vx * feel.lead, ly = p.vy * feel.lead, k = Math.min(1, 90 / (Math.hypot(lx, ly) || 1)); px += lx * k; py += ly * k; }
      // below and right of the pointer; flip at the edges, and come back only with 60 px to spare (no flicker)
      side.h = side.h > 0 ? (px + o + w > W - m ? -1 : 1) : (px + o + w < W - m - 60 ? 1 : -1);
      side.v = side.v > 0 ? (py + o + h > H - m ? -1 : 1) : (py + o + h < H - m - 60 ? 1 : -1);
      let tx = clamp(side.h > 0 ? px + o : px - o - w, m, W - m - w);
      let ty = clamp(side.v > 0 ? py + o : py - o - h, m, H - m - h);
      for (const r of obs) {
        if (!overlaps({ l: tx, t: ty, r: tx + w, b: ty + h }, r)) continue;
        if (r.t - h >= m) ty = r.t - h;
        else if (r.b + h <= H - m) ty = r.b;
        else tx = r.l - w >= m ? r.l - w : r.r;
      }
      return { x: tx, y: ty };
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      if (now - p.t > 120) p.vx = p.vy = 0;
      const obs = obstacles();
      const docked = !follow || !p.has;
      if (!docked && !Number.isNaN(x)) {
        // reaching for the bubble (inside its catch zone, or heading straight at it): hold still until the pointer leaves
        const dx = x + w / 2 - p.x, dy = y + h / 2 - p.y, d = Math.hypot(dx, dy) || 1, sp = Math.hypot(p.vx, p.vy);
        const toward = sp > 60 && (p.vx * dx + p.vy * dy) / (sp * d) > 0.8 && d < Math.max(w, h) / 2 + o * 3;
        frozen = frozen ? near(p.x, p.y, x, y, w, h, 80) : near(p.x, p.y, x, y, w, h, 32) || toward;
      }
      const t = docked ? dock(obs) : frozen ? { x, y } : aim(obs);
      if (Number.isNaN(x)) { x = t.x; y = t.y; }
      else if (docked) { const k = reduce ? 1 : 1 - Math.exp(-dt / 0.18); x += (t.x - x) * k; y += (t.y - y) * k; }
      else if (feel.fps) {
        // stepped: jump to where the pointer was, a few times a second
        acc += dt;
        if (acc >= 1 / feel.fps) { acc %= 1 / feel.fps; x = t.x; y = t.y; }
      } else {
        moving = now - p.t < 120 ? moving + dt : 0;
        const tau = feel.slowTau != null && feel.warm ? feel.slowTau + (feel.tau - feel.slowTau) * clamp(moving / feel.warm) : feel.tau;
        const k = tau > 0 ? 1 - Math.exp(-dt / tau) : 1;
        x += (t.x - x) * k; y += (t.y - y) * k;
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(frame);
    };
    frame(performance.now());
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [ref, run, follow, size, feel, reduce]);
}
