"use client";

import { useLocale, useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import { DEFAULT_LIKE, type LikeCarry } from "@/features/experience/like";
import { ERA_YEARS, RINGS, ringStyle, type EraYear } from "../engine/tunnel";

/** emoji had not reached the web yet */
const noEmoji = (s: string) => s.replace(/\p{Extended_Pictographic}️?/gu, "").replace(/\s{2,}/g, " ").trim();

/** murmur itself, re-skinned for one era: same logo, same launch post, same like count. */
function EraPage({ year, count }: { year: EraYear; count: { n: number; on: boolean; s: string } }) {
  const t = useTranslations("dive.eras");
  const tc = useTranslations("dive.content");
  const post = tc("posts.p1");
  const who = tc("users.mika");
  const heart = count.on ? "♥" : "♡";
  switch (year) {
    case 2016:
      return (
        <>
          <div className="bar">murmur<span>☰</span></div>
          <div className="card">
            <div className="who"><i />{who}</div>
            <p>{post}</p>
            <div className={count.on ? "lk on" : "lk"}>{heart} {count.s}</div>
          </div>
        </>
      );
    case 2010:
      return (
        <>
          <div className="nav">
            <b>murmur</b>
            <span>{t("e2010.home")}</span>
            <span>{t("e2010.profile")}</span>
          </div>
          <div className="well">
            <div className="who"><i />{who}</div>
            <p>{post}</p>
            <span className="btn">👍 {t("e2010.like")} <em>{count.s}</em></span>
          </div>
        </>
      );
    case 2006:
      return (
        <>
          <div className="hd">
            murmur
            <div className="beta">{t("e2006.beta")}</div>
          </div>
          <div className="box">
            <p><b>{who}</b> {post}</p>
            <span className="gel">{heart} {t("e2006.like")} ({count.s})</span>
          </div>
        </>
      );
    case 1997:
      return (
        <>
          <h3>{t("e1997.welcome")}</h3>
          <div className="uc" />
          <p>{noEmoji(post)}</p>
          <div className="ctr">
            {t("e1997.visitors")}{" "}
            {String(count.n % 1e6).padStart(6, "0").split("").map((d, i) => (
              <b key={i}>{d}</b>
            ))}
          </div>
          <div className="blink">{t("e1997.guestbook")}</div>
        </>
      );
    case 1991:
      return (
        <>
          <h3>murmur</h3>
          <p>{noEmoji(post)}</p>
          <p>{t.rich("e1991.link", { a: (c: ReactNode) => <a>{c}</a> })}</p>
        </>
      );
  }
}

/** Scene 3: CSS-3D time tunnel. The walls show murmur as each era would have built it. Panel placement and the camera are written by the engine. */
export function Tunnel({ like }: { like: LikeCarry }) {
  const t = useTranslations("dive.eras");
  const locale = useLocale();
  // the walls always show Mika's launch post, with the reader's like on it if that's the one they liked
  const mine = like.id === DEFAULT_LIKE.id;
  const n = mine ? like.likes : DEFAULT_LIKE.likes;
  const count = { n, on: mine && like.liked, s: new Intl.NumberFormat(locale).format(n) };
  return (
    <section className="scene s-tunnel" aria-hidden="true">
      <div className="world">
        {Array.from({ length: RINGS }, (_, i) => (
          <div key={i} className="ringz" style={ringStyle(i)} />
        ))}
        {ERA_YEARS.map((y) => (
          <Fragment key={y}>
            <div className={`panel p${y}`}>
              <EraPage year={y} count={count} />
            </div>
            <div className="tag">
              {y} · {t(`e${y}.tag`)}
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
