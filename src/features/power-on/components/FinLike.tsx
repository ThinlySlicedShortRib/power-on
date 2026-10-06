"use client";
import { useLocale } from "next-intl";
import type { LikeCarry } from "@/features/experience/like";
import { useStoryText } from "../i18n/rich";

/**
 * The ending: back in murmur, 2026. The reader's like (the one the dive opened) lands and the count goes +1,
 * in the same big like-button look as the dive's "Let's open the like button". The landing is pure CSS,
 * keyed off .po-fin.po-on (toggled by PowerOn's scroll update), so scrolling back up resets it.
 */
export function FinLike({ like }: { like: LikeCarry }) {
  const { t } = useStoryText();
  const nf = new Intl.NumberFormat(useLocale());
  const before = like.liked ? like.likes - 1 : like.likes;
  return (
    <div className="po-flike" data-theme={like.theme} role="img" aria-label={t("fin.likeAria", { count: nf.format(before + 1) })}>
      <div className="po-flike-top"><span className="po-flogo">murm<b>u</b>r</span><span>2026</span></div>
      <div className="po-flike-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
        <span className="po-fn">
          <span className="po-fn0">{nf.format(before)}</span>
          <span className="po-fn1">{nf.format(before + 1)}</span>
        </span>
        <i className="po-fplus" aria-hidden="true">+1</i>
      </div>
    </div>
  );
}
