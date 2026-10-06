"use client";
import { Advance } from "@/features/controls/Advance";
import { useStoryText } from "../i18n/rich";

/** The desk: the artifact's 3D room behind, copy on the left. */
export function Intro({ gone, hidden, touch, onPower, onReplay }: { gone: boolean; hidden: boolean; touch: boolean; onPower: () => void; onReplay?: () => void }) {
  const { t, rich } = useStoryText();
  return (
    <div className={"po-introbox" + (gone ? " po-gone" : "")} style={hidden ? { visibility: "hidden" } : undefined}>
      <div className="po-introcopy">
        <div className="po-top"><span>{t("intro.place")}</span><span>{t("intro.date")}</span></div>
        <h1>{rich("intro.headline")}</h1>
        <p>{t("intro.lede")}</p>
        <div className="po-ctas">
          <Advance era={0} kind="power" touch={touch} onClick={onPower} />
          {onReplay && <button className="po-ghost" type="button" onClick={onReplay}>{t("intro.replay")}</button>}
        </div>
      </div>
    </div>
  );
}
