"use client";

import { useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import { initial, type Author } from "./content";

export function Avatar({ user, size }: { user: Pick<Author, "name" | "color">; size?: "sm" | "xl" }) {
  return (
    <div className={size ? `av ${size}` : "av"} style={{ background: user.color }} aria-hidden="true">
      {initial(user.name)}
    </div>
  );
}

export function Logo() {
  return (
    <div className="logo">
      murm<b>u</b>r
    </div>
  );
}

// A hashtag: '#' not preceded by a word char or '&'. Unicode-aware so translated tags work too.
const TAG_RE = /(?<![&\p{L}\p{N}_])#([\p{L}\p{N}_]+)/gu;

export function hashtags(text: string): string[] {
  return Array.from(text.matchAll(TAG_RE), (m) => m[1]);
}

/** Post text: line breaks + clickable hashtags. */
export function RichText({ text, onTag }: { text: string; onTag: (tag: string) => void }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => {
        const out: ReactNode[] = [];
        let at = 0;
        for (const m of line.matchAll(TAG_RE)) {
          const idx = m.index ?? 0;
          if (idx > at) out.push(line.slice(at, idx));
          const tag = "#" + m[1];
          out.push(
            <button key={idx} type="button" className="tagl" onClick={() => onTag(tag)}>
              {tag}
            </button>,
          );
          at = idx + m[0].length;
        }
        if (at < line.length) out.push(line.slice(at));
        return (
          <Fragment key={li}>
            {li > 0 && <br />}
            {out}
          </Fragment>
        );
      })}
    </>
  );
}

/** "now" / "5m" / "3h" / "2d" */
export function Ago({ ts, now }: { ts: number; now: number }) {
  const t = useTranslations("dive.app");
  const s = (now - ts) / 1000;
  if (s < 45) return <>{t("now")}</>;
  if (s < 3600) return <>{t("minutes", { n: Math.round(s / 60) })}</>;
  if (s < 86400) return <>{t("hours", { n: Math.round(s / 3600) })}</>;
  return <>{t("days", { n: Math.round(s / 86400) })}</>;
}
