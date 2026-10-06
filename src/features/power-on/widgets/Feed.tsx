"use client";
import { useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";

const COLS = ["#e74c3c", "#3498db", "#1abc9c", "#f1c40f", "#9b59b6", "#e67e22"];
const MAX = 80;

/** Infinite scroll: the feed never ends (well, at 80). */
export function Feed() {
  const { t } = useStoryText();
  const { audio } = usePowerOn();
  const [n, setN] = useState(8);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const l = e.currentTarget;
    if (l.scrollTop + l.clientHeight > l.scrollHeight - 40 && n < MAX) setN(Math.min(MAX, n + 5));
  };
  return (
    <div className="po-card po-feed" style={{ width: "min(100%, 440px)" }}>
      <div className="po-bar">
        <span><i style={{ display: "inline-block", width: 14, height: 2, background: "currentColor", boxShadow: "0 -5px 0 currentColor,0 5px 0 currentColor", verticalAlign: "middle", marginRight: 8 }} />{t("widgets.feed.bar")}</span>
        <span>{n >= MAX ? t("widgets.feed.end", { n }) : t("widgets.feed.posts", { n })}</span>
      </div>
      <div className="po-list" onScroll={onScroll}>
        {Array.from({ length: n }, (_, i) => {
          const on = !!liked[i], base = (i * 7) % 23;
          return (
            <div className="po-post" key={i}>
              <span className="po-av" style={{ background: COLS[i % 6] }} />
              <span>{t(`widgets.feed.p${(i % 8) + 1}`)}</span>
              <button className={"po-like" + (on ? " po-on" : "")} type="button" aria-pressed={on} aria-label={t("widgets.feed.like")}
                onClick={() => { setLiked({ ...liked, [i]: !on }); audio.blip(1500); }}>
                ♥ <span>{base + (on ? 1 : 0)}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
