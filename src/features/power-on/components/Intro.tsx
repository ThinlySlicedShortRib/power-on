"use client";
import { Advance } from "@/features/controls/Advance";
import { useStoryText } from "../i18n/rich";

const OPENING = ["intro.open1", "intro.open2", "intro.open3"] as const;

/**
 * Before the story: the opening shot (camera close on the cube's note, one caption per beat, then the pull-back),
 * then the desk itself with the artifact's 3D room behind and the copy on the left. `opening` is the caption beat,
 * or -1 once the desk is shown.
 */
export function Intro({ gone, hidden, touch, opening, onNext, onPower }: {
  gone: boolean; hidden: boolean; touch: boolean; opening: number; onNext: () => void; onPower: () => void;
}) {
  const { t, rich } = useStoryText();
  return (
    <div className={"po-introbox" + (gone ? " po-gone" : "") + (opening >= 0 ? " po-opening" : "")} style={hidden ? { visibility: "hidden" } : undefined}>
      {opening >= 0 ? (
        <div className="po-introcopy" key={opening}>
          <p className="po-openline">{t(OPENING[opening])}</p>
          <div className="po-ctas"><Advance era={0} kind="next" touch={touch} onClick={onNext} /></div>
        </div>
      ) : (
        <div className="po-introcopy po-deskcopy">
          <div className="po-top"><span>{t("intro.place")}</span><span>{t("intro.date")}</span></div>
          <h1>{rich("intro.headline")}</h1>
          <p>{t("intro.lede")}</p>
          <div className="po-ctas"><Advance era={0} kind="power" touch={touch} onClick={onPower} /></div>
        </div>
      )}
    </div>
  );
}
