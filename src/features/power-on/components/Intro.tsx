"use client";
import { useStoryText } from "../i18n/rich";

/** The desk: the artifact's 3D room behind, copy on the left. */
export function Intro({ gone, hidden, onPower, onReplay }: { gone: boolean; hidden: boolean; onPower: () => void; onReplay?: () => void }) {
  const { t, rich } = useStoryText();
  return (
    <div className={"po-introbox" + (gone ? " po-gone" : "")} style={hidden ? { visibility: "hidden" } : undefined}>
      <div className="po-introcopy">
        <div className="po-top"><span>{t("intro.place")}</span><span>{t("intro.date")}</span></div>
        <h1>{rich("intro.headline")}</h1>
        <p>{t("intro.lede")}</p>
        <div className="po-ctas">
          <button className={"po-power" + (gone ? "" : " po-pulse")} type="button" aria-label={t("intro.powerAria")} onClick={onPower}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 3v8" /><path d="M6.3 6.6a8 8 0 1 0 11.4 0" /></svg>
            {t("intro.power")}
          </button>
          {onReplay && <button className="po-ghost" type="button" onClick={onReplay}>{t("intro.replay")}</button>}
        </div>
        <p className="po-introkeys"><span className="po-kbonly">{rich("intro.keysKb")}</span><span className="po-touchonly">{t("intro.keysTouch")}</span></p>
      </div>
    </div>
  );
}
