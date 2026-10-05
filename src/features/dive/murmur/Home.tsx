"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { Avatar } from "./bits";
import type { Resolver } from "./content";
import { EMOJI, USER_COLORS, USER_KEYS } from "./data";
import { Icon } from "./icons";
import type { MurmurActions } from "./actions";
import { Post } from "./Post";
import type { MurmurState } from "./state";

const LIMIT = 280;

function Stories({ seen, r, actions }: { seen: MurmurState["seen"]; r: Resolver; actions: MurmurActions }) {
  const t = useTranslations("dive.app");
  return (
    <div className="stories">
      {USER_KEYS.map((h, i) => {
        const u = r.author(h);
        return (
          <button key={h} type="button" className="story" aria-label={t("openStory", { name: u.name })} onClick={() => actions.openStory(i)}>
            <span className={`ring${seen[h] ? " seen" : ""}`}>
              <span style={{ background: USER_COLORS[h] }}>{u.name.charAt(0)}</span>
            </span>
            {u.name.split(" ")[0]}
          </button>
        );
      })}
    </div>
  );
}

function Composer({ draft, emoji, r, actions }: { draft: string; emoji: boolean; r: Resolver; actions: MurmurActions }) {
  const t = useTranslations("dive.app");
  const ta = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);
  const left = LIMIT - draft.length;

  // put the caret back after an emoji was inserted
  useEffect(() => {
    const el = ta.current;
    if (el && caret.current !== null) {
      el.focus();
      el.selectionStart = el.selectionEnd = caret.current;
      caret.current = null;
    }
  }, [draft]);

  // click anywhere outside closes the emoji picker
  useEffect(() => {
    if (!emoji) return;
    const onDoc = (e: MouseEvent) => {
      const tg = e.target instanceof Element ? e.target : null;
      if (tg && !tg.closest(".emo, [data-emoji-toggle]")) actions.setEmoji(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [emoji, actions]);

  const insert = (e: string) => {
    const el = ta.current;
    const s0 = el?.selectionStart ?? draft.length;
    const s1 = el?.selectionEnd ?? s0;
    caret.current = s0 + e.length;
    actions.setDraft(draft.slice(0, s0) + e + draft.slice(s1));
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      actions.submitPost();
    }
  };

  return (
    <div className="compose">
      <Avatar user={r.author("me")} />
      <div className="cbox">
        <textarea
          ref={ta}
          rows={2}
          maxLength={320}
          placeholder={t("composePlaceholder")}
          aria-label={t("composeLabel")}
          value={draft}
          onChange={(e) => actions.setDraft(e.target.value)}
          onKeyDown={onKey}
        />
        <div className="crow">
          <button type="button" className="iconbtn" data-emoji-toggle aria-label={t("addEmoji")} aria-expanded={emoji} onClick={() => actions.setEmoji(!emoji)}>
            <Icon name="smile" />
          </button>
          {emoji && (
            <div className="emo">
              {EMOJI.map((e) => (
                <button key={e} type="button" aria-label={t("insertEmoji", { emoji: e })} onClick={() => insert(e)}>
                  {e}
                </button>
              ))}
            </div>
          )}
          <span className={`cnt${left < 0 ? " over" : left < 20 ? " warn" : ""}`}>{left}</span>
          <button type="button" className="pill solid" disabled={!draft.trim() || left < 0} onClick={actions.submitPost}>
            {t("post")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Home({ s, r, now, actions, reduce }: { s: MurmurState; r: Resolver; now: number; actions: MurmurActions; reduce: boolean }) {
  const t = useTranslations("dive.app");
  return (
    <>
      <div className="vhead">
        <h2>{t("nav.home")}</h2>
      </div>
      <Stories seen={s.seen} r={r} actions={actions} />
      <Composer draft={s.draft} emoji={s.emoji} r={r} actions={actions} />
      {s.pending.length > 0 && (
        <button type="button" className="newpill" onClick={actions.showPending}>
          {t("newPosts", { count: s.pending.length })}
        </button>
      )}
      <div className="ptr">{t("pullToRefresh")}</div>
      <div className="list">
        {s.posts.map((p) => (
          <Post key={p.id} post={p} open={!!s.open[p.id]} now={now} r={r} actions={actions} reduce={reduce} />
        ))}
      </div>
      <div className="more">
        {s.loading ? (
          <>
            <Skeleton />
            <Skeleton />
          </>
        ) : s.caughtUp ? (
          <p className="end">{t("caughtUp")}</p>
        ) : null}
      </div>
    </>
  );
}

function Skeleton() {
  return (
    <div className="skel" aria-hidden="true">
      <i style={{ width: "40%" }} />
      <i />
      <i style={{ width: "75%" }} />
    </div>
  );
}
