"use client";
import { useStoryText } from "../i18n/rich";

const MARKS: [number, string][] = [[-30, "m1"], [-24, "m2"], [-6, "m3"], [26, "m4"], [-14, "m5"], [-26, "m6"]];

/** Where does the HTML get made? Server, browser, server again. */
export function Pendulum() {
  const { t } = useStoryText();
  const mono = "var(--f-mono)", sans = "var(--f-sans)";
  return (
    <div className="po-card po-pend" style={{ width: "min(100%, 560px)" }}>
      <div className="po-bar"><span>{t("widgets.pend.bar")}</span><span>{t("widgets.pend.span")}</span></div>
      <div className="po-body" style={{ color: "var(--fg)" }}>
        <svg viewBox="0 0 600 330" role="img" aria-label={t("widgets.pend.aria")}>
          <path d="M120 268 A260 260 0 0 0 480 268" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" />
          <text x="40" y="318" fill="currentColor" fontSize="15" fontFamily={mono}>{t("widgets.pend.server")}</text>
          <text x="560" y="318" textAnchor="end" fill="currentColor" fontSize="15" fontFamily={mono}>{t("widgets.pend.browser")}</text>
          {MARKS.map(([deg, k]) => {
            const a = (deg * Math.PI) / 180, x = 300 + Math.sin(a) * 262, y = 30 + Math.cos(a) * 262;
            return (
              <g key={k}>
                <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill="#ff9a4d" />
                <text x={x.toFixed(1)} y={(y + 22).toFixed(1)} textAnchor="middle" fill="currentColor" fontSize="11" fontFamily={sans} opacity=".8">{t(`widgets.pend.${k}`)}</text>
              </g>
            );
          })}
          <g className="po-arm"><line x1="300" y1="30" x2="300" y2="262" stroke="currentColor" strokeWidth="2" /><circle cx="300" cy="262" r="20" fill="#ff9a4d" /></g>
          <circle cx="300" cy="30" r="6" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
