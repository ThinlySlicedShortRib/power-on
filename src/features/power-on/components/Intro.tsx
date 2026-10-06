"use client";
import { Advance } from "@/features/controls/Advance";
import { useStoryText } from "../i18n/rich";

/**
 * The desk: the story's first line, not a title page. The artifact's 3D room is behind; on the left, one line in the
 * dive's caption style ("March 1989…") with Power on under it, so the tunnel lands straight into the story.
 */
export function Intro({ gone, hidden, touch, onPower, onReplay }: { gone: boolean; hidden: boolean; touch: boolean; onPower: () => void; onReplay?: () => void }) {
  const { t, rich } = useStoryText();
  return (
    <div className={"po-introbox" + (gone ? " po-gone" : "")} style={hidden ? { visibility: "hidden" } : undefined}>
      <div className="po-introcopy">
        <p className="po-deskline">{rich("intro.line")}</p>
        <div className="po-ctas">
          <Advance era={0} kind="power" touch={touch} onClick={onPower} />
          {onReplay && <button className="po-ghost" type="button" onClick={onReplay}>{t("intro.replay")}</button>}
        </div>
      </div>
    </div>
  );
}
