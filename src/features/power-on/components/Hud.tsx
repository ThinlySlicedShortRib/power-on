"use client";
import { ERAS } from "../content/eras";
import { useStoryText } from "../i18n/rich";

/** The era badge, bottom-left. The controls are the shared bar (features/controls). */
export function Hud({ on, era: i }: { on: boolean; era: number }) {
  const { t } = useStoryText();
  const era = ERAS[i];
  return (
    <div className={"po-hud po-hudEra" + (on ? " po-on" : "")} aria-hidden="true">
      <span className="po-yr">{t(`eras.${era.key}.span`)}</span>
      <span className="po-hudName">{t(`eras.${era.key}.name`)}</span>
      <span className="po-pips">{ERAS.map((_, j) => <i key={j} className={j <= i ? "po-on" : ""} />)}</span>
    </div>
  );
}
