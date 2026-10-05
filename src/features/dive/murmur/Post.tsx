"use client";

import { useTranslations } from "next-intl";
import { memo, useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Ago, Avatar, RichText } from "./bits";
import type { Resolver } from "./content";
import { Icon } from "./icons";
import type { MurmurActions } from "./actions";
import type { Post as PostModel } from "./state";

/** A number that plays a small "tick" when it changes (not on first render). */
function Count({ value, fmt }: { value: number; fmt: (n: number) => string }) {
  const [prev, setPrev] = useState(value);
  const [ticks, setTicks] = useState(0);
  if (prev !== value) {
    setPrev(value);
    setTicks(ticks + 1);
  }
  return (
    <span key={ticks} className={ticks ? "n tick" : "n"}>
      {fmt(value)}
    </span>
  );
}

const SPARKS = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);

function LikeButton({ post, actions, fmt, reduce }: { post: PostModel; actions: MurmurActions; fmt: (n: number) => string; reduce: boolean }) {
  const t = useTranslations("dive.app.act");
  const [burst, setBurst] = useState({ n: 0, sparks: false });
  useEffect(() => {
    if (!burst.sparks) return;
    const h = window.setTimeout(() => setBurst((b) => ({ ...b, sparks: false })), 650);
    return () => window.clearTimeout(h);
  }, [burst]);
  return (
    <button
      type="button"
      className={`act like${post.liked ? " on" : ""}${burst.n ? " pop" : ""}`}
      aria-pressed={!!post.liked}
      aria-label={t("like")}
      data-like={post.id}
      onClick={() => {
        if (!post.liked && !reduce) setBurst((b) => ({ n: b.n + 1, sparks: true }));
        actions.like(post.id);
      }}
    >
      <Icon key={burst.n} name="heart" />
      <Count value={post.likes} fmt={fmt} />
      {burst.sparks && SPARKS.map((r) => <i key={`${burst.n}-${r}`} className="spark" style={{ "--r": `${r}deg` } as CSSProperties} />)}
    </button>
  );
}

function Thread({ post, r, actions }: { post: PostModel; r: Resolver; actions: MurmurActions }) {
  const t = useTranslations("dive.app");
  const [text, setText] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    actions.reply(post.id, v);
    setText("");
  };
  return (
    <div className="thread">
      {post.replies.map((rep, i) => {
        const u = r.author(rep.u);
        return (
          <div className="reply" key={i}>
            <Avatar user={u} size="sm" />
            <div>
              <b>{u.name}</b>
              {r.replyText(rep)}
            </div>
          </div>
        );
      })}
      <form className="rform" onSubmit={submit}>
        <input
          className="field rin"
          maxLength={200}
          placeholder={t("replyPlaceholder")}
          aria-label={t("replyLabel")}
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="pill solid" type="submit">
          {t("replySubmit")}
        </button>
      </form>
    </div>
  );
}

interface PostProps {
  post: PostModel;
  open: boolean;
  now: number;
  r: Resolver;
  actions: MurmurActions;
  reduce: boolean;
}

function PostImpl({ post, open, now, r, actions, reduce }: PostProps) {
  const t = useTranslations("dive.app");
  const u = r.author(post.u);
  const cls = `post${post.anim === "pending" ? " new pending" : post.anim === "new" ? " new" : ""}`;
  return (
    <article className={cls} data-id={post.id}>
      <div className="who">
        <Avatar user={u} />
        <div className="wn">
          <b>{u.name}</b>
          <small>
            @{u.handle} · <Ago ts={post.ts} now={now} />
          </small>
        </div>
      </div>
      <p className="txt">
        <RichText text={r.postText(post)} onTag={actions.tag} />
      </p>
      {post.pic === 1 && <div className="pic pic1" />}
      {post.pic === 2 && (
        <div className="pic pic2">
          <span className="pic-cap">{t("underConstruction")}</span>
        </div>
      )}
      <div className="acts">
        <button
          type="button"
          className={`act rep${open ? " on" : ""}`}
          aria-expanded={open}
          aria-label={t("act.reply")}
          onClick={() => actions.toggleThread(post.id)}
        >
          <Icon name="reply" />
          <span className="n">{r.fmt(post.rbase + post.replies.length)}</span>
        </button>
        <button type="button" className={`act rp${post.rp ? " on" : ""}`} aria-pressed={!!post.rp} aria-label={t("act.repost")} onClick={() => actions.repost(post.id)}>
          <Icon name="repost" />
          <span className="n">{r.fmt(post.reposts)}</span>
        </button>
        <LikeButton post={post} actions={actions} fmt={r.fmt} reduce={reduce} />
        <button type="button" className={`act bm${post.bm ? " on" : ""}`} aria-pressed={!!post.bm} aria-label={t("act.bookmark")} onClick={() => actions.bookmark(post.id)}>
          <Icon name="bookmark" />
        </button>
        <button type="button" className="act" aria-label={t("act.share")} onClick={() => actions.share(post.id)}>
          <Icon name="share" />
        </button>
      </div>
      {open && <Thread post={post} r={r} actions={actions} />}
    </article>
  );
}

export const Post = memo(PostImpl);
