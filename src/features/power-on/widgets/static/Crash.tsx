"use client";
import { useStoryText } from "../../i18n/rich";

const PTS: [number, number][] = [[1995, 750], [1996, 1050], [1997, 1300], [1998, 1570], [1999, 2200], [1999.9, 4000], [2000.2, 5048], [2000.5, 3900], [2001, 2470], [2001.5, 2100], [2002, 1950], [2002.8, 1114]];
const X = (y: number) => 40 + ((y - 1995) / 8) * 400;
const Y = (v: number) => 210 - (v / 5500) * 190;
const D = PTS.map((p, i) => (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1)).join(" ");
const CN = "'Courier New', var(--font-cjk), monospace";

export function Crash() {
  const { t, rich } = useStoryText();
  return (
    <div className="po-card po-crash" style={{ width: "min(100%, 500px)" }}>
      <div className="po-bar"><span>{rich("props.crash.bar")}</span><span className="po-newbadge">{rich("props.crash.badge")}</span></div>
      <div className="po-body">
        <svg viewBox="0 0 460 240" role="img" aria-label={t("props.crash.aria")}>
          {[1000, 3000, 5000].map((v) => (
            <g key={v}>
              <line x1="40" x2="440" y1={Y(v)} y2={Y(v)} stroke="#888" strokeDasharray="2 3" />
              <text x="4" y={Y(v) + 4} fontSize="11" fontFamily={CN}>{v}</text>
            </g>
          ))}
          {[1995, 1997, 1999, 2001, 2003].map((y) => <text key={y} x={X(y) - 14} y="232" fontSize="11" fontFamily={CN}>{y}</text>)}
          <path d={D} fill="none" stroke="#c00000" strokeWidth="3" />
          <circle cx={X(2000.2)} cy={Y(5048)} r="5" fill="#c00000" />
          <text x={X(2000.2) + 8} y={Y(5048) + 4} fontSize="12" fontWeight="700" fontFamily={CN}>{t("props.crash.peak")}</text>
          <text x={X(2002.8) - 76} y={Y(1114) + 18} fontSize="12" fontFamily={CN}>{t("props.crash.low")}</text>
        </svg>
        <small>{rich("props.crash.caption")}</small>
      </div>
    </div>
  );
}
