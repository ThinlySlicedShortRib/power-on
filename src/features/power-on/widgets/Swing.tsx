"use client";
import type { CSSProperties } from "react";
import { useStoryText } from "../i18n/rich";

/** Where the work happens, per era (1-based): an angle on the server ↔ browser arc, or lifted off it to a third pole. */
export interface SwingPose { a: number; lift: number }
const SERVER: SwingPose = { a: -38, lift: 0 };
export const SWING: Record<1 | 2 | 3 | 4 | 5 | 6, SwingPose> = {
  1: SERVER, 2: SERVER,
  3: { a: -10, lift: 0 }, // Ajax: drifting to the browser
  4: { a: 38, lift: 0 }, // the browser
  5: { a: -26, lift: 0 }, // back to the server, at the edge
  6: { a: 0, lift: 1 }, // a third pole: who's reading
};

/** CSS custom properties for a pose between two eras (k = 0..1); the trans screen writes these on scroll. */
export function swingVars(from: SwingPose, to: SwingPose, k: number): Record<"--sw-a" | "--sw-lift" | "--sw-rd", string> {
  const a = from.a + (to.a - from.a) * k, lift = from.lift + (to.lift - from.lift) * k;
  return { "--sw-a": a.toFixed(2), "--sw-lift": lift.toFixed(3), "--sw-rd": to.lift ? (0.35 + 0.65 * k).toFixed(3) : from.lift ? "1" : "0" };
}

/**
 * The server ↔ browser pendulum, small: the story's spine. Introduced in era 1, shown on every era transition,
 * paid off by the big pendulum widgets (w-pend, w-pend3). The pose comes from inherited CSS vars (see swingVars).
 */
export function SwingMark({ label }: { label?: string }) {
  const { t } = useStoryText();
  return (
    <svg className="po-swing" viewBox="0 0 240 146" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d="M60.3 96.1 A78 78 0 0 0 179.7 96.1" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="2" strokeDasharray="3 5" />
      <text x="44" y="138" textAnchor="middle">{t("swing.server")}</text>
      <text x="196" y="138" textAnchor="middle">{t("swing.browser")}</text>
      <g className="po-sw-rd">
        <circle cx="120" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="134" y="24">{t("swing.reader")}</text>
      </g>
      <g className="po-sw-arm">
        <line x1="120" y1="46" x2="120" y2="124" stroke="currentColor" strokeWidth="2" />
        <circle className="po-sw-bob" cx="120" cy="124" r="9" />
      </g>
      <circle cx="120" cy="46" r="3.5" fill="currentColor" />
    </svg>
  );
}

/** Era 1's prop: the pendulum, introduced. The work happens on the server. */
export function Swing() {
  const { t } = useStoryText();
  return (
    <div className="po-card po-swingw" style={{ width: "min(100%, 440px)", ...(swingVars(SERVER, SERVER, 0) as CSSProperties) }}>
      <div className="po-bar"><span>{t("widgets.swing.bar")}</span><span>1990</span></div>
      <div className="po-body">
        <SwingMark label={t("widgets.swing.aria")} />
        <p className="po-sw-where">{t("swing.where.e1")}</p>
      </div>
    </div>
  );
}
