"use client";
import { useStoryText } from "../i18n/rich";

export function Intro({ gone, hidden, onPower }: { gone: boolean; hidden: boolean; onPower: () => void }) {
  const { t, rich } = useStoryText();
  return (
    <div className={"po-introbox" + (gone ? " po-gone" : "")} style={hidden ? { visibility: "hidden" } : undefined}>
      <div className="po-top"><span>{t("intro.place")}</span><span>{t("intro.date")}</span></div>
      <h1>{rich("intro.headline")}</h1>
      <div className="po-bottom">
        <p>{t("intro.lede")}</p>
        <button className={"po-power" + (gone ? "" : " po-pulse")} type="button" aria-label={t("intro.powerAria")} onClick={onPower}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 3v8" /><path d="M6.3 6.6a8 8 0 1 0 11.4 0" /></svg>
          {t("intro.power")}
        </button>
        <p className="po-introkeys"><span className="po-kbonly">{rich("intro.keysKb")}</span><span className="po-touchonly">{t("intro.keysTouch")}</span></p>
      </div>
    </div>
  );
}
