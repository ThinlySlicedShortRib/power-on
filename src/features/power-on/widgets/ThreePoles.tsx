"use client";
import { useStoryText } from "../i18n/rich";

/** The pendulum gets a third pole: who's reading. */
export function ThreePoles() {
  const { t } = useStoryText();
  return (
    <div className="po-card po-pend3" style={{ width: "min(100%, 520px)" }}>
      <div className="po-bar"><span>{t("widgets.pend3.bar")}</span><span>{t("widgets.pend3.span")}</span></div>
      <div className="po-body">
        <svg viewBox="0 0 520 300" role="img" aria-label={t("widgets.pend3.aria")}>
          <path d="M70 250 L450 250 L260 40 Z" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" strokeDasharray="4 6" />
          <circle cx="70" cy="250" r="9" fill="currentColor" />
          <text x="70" y="282" textAnchor="middle" fill="currentColor" fontSize="15">{t("widgets.pend3.server")}</text>
          <text x="70" y="232" textAnchor="middle" fill="currentColor" fontSize="11" opacity=".6">{t("widgets.pend3.serverYrs")}</text>
          <circle cx="450" cy="250" r="9" fill="currentColor" />
          <text x="450" y="282" textAnchor="middle" fill="currentColor" fontSize="15">{t("widgets.pend3.browser")}</text>
          <text x="450" y="232" textAnchor="middle" fill="currentColor" fontSize="11" opacity=".6">{t("widgets.pend3.browserYrs")}</text>
          <circle cx="260" cy="40" r="11" fill="#ff5a36" />
          <text x="260" y="22" textAnchor="middle" fill="#ff5a36" fontSize="15">{t("widgets.pend3.agent")}</text>
          <circle className="po-p3dot" r="8" fill="#0fa3a3">
            <animateMotion dur="7s" repeatCount="indefinite" path="M70 250 L450 250 L120 250 L260 40" keyPoints="0;0.42;0.79;1" keyTimes="0;0.35;0.65;1" calcMode="linear" />
          </circle>
        </svg>
      </div>
    </div>
  );
}
