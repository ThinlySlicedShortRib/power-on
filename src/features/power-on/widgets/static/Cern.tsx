"use client";
import { useStoryText } from "../../i18n/rich";

export function Cern() {
  const { t, rich } = useStoryText();
  const tx = { fill: "currentColor", fontFamily: "var(--f-term)" } as const;
  return (
    <div className="po-card" style={{ width: "min(100%, 480px)" }}>
      <div className="po-bar"><span>{rich("props.cern.bar")}</span><span>{rich("props.cern.north")}</span></div>
      <div className="po-body">
        <svg viewBox="0 0 420 260" style={{ width: "100%", color: "var(--fg)" }} role="img" aria-label={t("props.cern.aria")}>
          <path d="M40 30 C120 90 150 120 170 250" fill="none" stroke="currentColor" strokeDasharray="6 6" opacity=".6" />
          <text x="44" y="22" fontSize="14" {...tx}>{t("props.cern.border")}</text>
          <ellipse cx="210" cy="140" rx="150" ry="92" fill="none" stroke="currentColor" strokeWidth="3" />
          <text x="410" y="250" fontSize="15" {...tx} textAnchor="end">{t("props.cern.ring")}</text>
          <rect x="318" y="44" width="70" height="26" fill="none" stroke="currentColor" />
          <text x="324" y="62" fontSize="15" {...tx}>{t("props.cern.geneva")}</text>
          <circle cx="132" cy="196" r="7" fill="#ffd23d" />
          <text x="146" y="200" fill="#ffd23d" fontSize="16" fontFamily="var(--f-term)">{t("props.cern.office")}</text>
        </svg>
      </div>
    </div>
  );
}
