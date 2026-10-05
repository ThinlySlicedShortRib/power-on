"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Avatar } from "./bits";
import type { Resolver } from "./content";
import { STORY_BG, USER_KEYS } from "./data";
import { Icon } from "./icons";
import type { MurmurActions } from "./actions";

const SLIDE_MS = 3800;

/** Full-bleed story viewer over the app. Progress runs in rAF and is written straight to the bar. */
export function StoryViewer({ i, s, n, r, actions }: { i: number; s: number; n: number; r: Resolver; actions: MurmurActions }) {
  const t = useTranslations("dive.app");
  const h = USER_KEYS[i];
  const u = r.author(h);
  const bgs = STORY_BG[h];
  const texts = r.content.stories[h] ?? [];
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const p = (now - t0) / SLIDE_MS;
      if (bar.current) bar.current.style.width = `${Math.min(100, p * 100)}%`;
      if (p >= 1) actions.storyStep(1);
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [i, s, n, actions]);

  return (
    <div className="sv" role="dialog" aria-label={t("story")}>
      <div className="card">
        <div className="slide" style={{ background: bgs[s] }}>
          {texts[s] ?? ""}
        </div>
        <div className="bars">
          {bgs.map((_, k) => (
            <span key={k}>
              <i ref={k === s ? bar : undefined} style={k < s ? { width: "100%" } : undefined} />
            </span>
          ))}
        </div>
        <div className="head">
          <Avatar user={u} size="sm" />
          <b>{u.name}</b>
          <button type="button" className="x" aria-label={t("closeStory")} onClick={actions.closeStory}>
            <Icon name="close" />
          </button>
        </div>
        <button type="button" className="zone zl" aria-label={t("prev")} onClick={() => actions.storyStep(-1)} />
        <button type="button" className="zone zr" aria-label={t("next")} onClick={() => actions.storyStep(1)} />
        <div className="tip">{t("storyTip")}</div>
      </div>
    </div>
  );
}
