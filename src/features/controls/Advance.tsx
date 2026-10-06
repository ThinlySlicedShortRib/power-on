"use client";

import { useTranslations } from "next-intl";
import "./advance.css";

export type AdvanceKind = "start" | "next" | "power";

/**
 * The one way forward, on every screen: "Show me" on the landing, "Next" through the dive and the story,
 * "Power on" at the desk. It sits under the current copy; only its costume changes with the era
 * (data-era: 0 = the landing and the 1989 desk, 1–6 = the story's eras). Desktop shows the key that does the same.
 */
export function Advance({ era, kind, onClick, touch }: { era: number; kind: AdvanceKind; onClick: () => void; touch: boolean }) {
  const t = useTranslations("common.advance");
  return (
    <button type="button" className={"adv adv-" + kind} data-era={era} onClick={onClick}>
      {kind === "power" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 3v8" /><path d="M6.3 6.6a8 8 0 1 0 11.4 0" /></svg>
      )}
      <span>{t(kind)}</span>
      {kind !== "power" && <span className="adv-arr" aria-hidden="true">↓</span>}
      {!touch && <span className="adv-key" aria-hidden="true">{kind === "power" ? t("enter") : t("space")}</span>}
    </button>
  );
}
