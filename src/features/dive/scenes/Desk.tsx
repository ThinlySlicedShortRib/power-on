"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const i = (c: ReactNode) => <i>{c}</i>;

/**
 * Scene 4: CERN, 1989. A NeXTcube on a desk. Power On boots this same desk, so the framing and
 * colours here must stay in sync with that feature for a seamless handoff.
 */
export function Desk({ onPowerOn, onReplay }: { onPowerOn: () => void; onReplay: () => void }) {
  const t = useTranslations("dive.desk");
  return (
    <section className="scene s-desk" aria-label={t("label")}>
      <div className="desk-wrap">
        <div className="desk-copy">
          <div className="top">{t("top")}</div>
          <h1>{t.rich("headline", { i })}</h1>
          <p>{t("lead")}</p>
          <div className="ctas">
            <button type="button" className="power" onClick={onPowerOn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 3v8" />
                <path d="M6.3 6.6a8 8 0 1 0 11.4 0" />
              </svg>
              {t("power")}
            </button>
            <button type="button" className="ghost" onClick={onReplay}>
              {t("replay")}
            </button>
          </div>
        </div>
        <div className="rig" aria-hidden="true">
          <div className="lampglow" />
          <div className="desktop" />
          <div className="cube">
            <div className="note">{t("note")}</div>
          </div>
          <div className="mon">
            <div className="screen" />
          </div>
        </div>
      </div>
    </section>
  );
}
