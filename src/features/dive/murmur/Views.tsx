"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Ago, Avatar, hashtags } from "./bits";
import type { Resolver } from "./content";
import { CHAT_KEYS, SWATCHES, TAG_BASE, WHO_TO_FOLLOW, type UserKey } from "./data";
import { Icon } from "./icons";
import type { MurmurActions } from "./actions";
import { Post } from "./Post";
import type { MurmurState } from "./state";

interface ViewProps {
  s: MurmurState;
  r: Resolver;
  now: number;
  actions: MurmurActions;
  reduce: boolean;
}

/* ---------- shared by Explore and the right rail ---------- */

export function trending(s: MurmurState, r: Resolver): Array<[string, number]> {
  const c: Record<string, number> = {};
  for (const [id, n] of Object.entries(TAG_BASE)) c[r.content.tags[id] ?? id] = n;
  for (const p of s.posts) for (const tag of hashtags(r.postText(p))) c[tag] = (c[tag] ?? 0) + 1;
  return Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}

export function FollowRow({ h, on, r, actions }: { h: UserKey; on: boolean; r: Resolver; actions: MurmurActions }) {
  const t = useTranslations("dive.app");
  const u = r.author(h);
  return (
    <div className="wtf">
      <Avatar user={u} />
      <div className="wn">
        <b>{u.name}</b>
        <small>@{h}</small>
      </div>
      <button type="button" className={on ? "pill" : "pill solid"} aria-pressed={on} onClick={() => actions.follow(h)}>
        {on ? t("following") : t("follow")}
      </button>
    </div>
  );
}

export function Rail({ s, r, actions }: Pick<ViewProps, "s" | "r" | "actions">) {
  const t = useTranslations("dive.app");
  return (
    <>
      <h3>{t("trending")}</h3>
      {trending(s, r)
        .slice(0, 4)
        .map(([tag, n]) => (
          <button key={tag} type="button" className="trend" onClick={() => actions.tag("#" + tag)}>
            <b>#{tag}</b>
            <small>{t("tagPosts", { count: r.fmt(n) })}</small>
          </button>
        ))}
      <h3>{t("whoToFollow")}</h3>
      {WHO_TO_FOLLOW.map((h) => (
        <FollowRow key={h} h={h} on={!!s.follows[h]} r={r} actions={actions} />
      ))}
    </>
  );
}

/* ---------- Explore ---------- */

export function Explore({ s, r, now, actions, reduce }: ViewProps) {
  const t = useTranslations("dive.app");
  const q = s.q.trim().toLowerCase();
  const list = !q
    ? [...s.posts].sort((a, b) => b.likes - a.likes).slice(0, 4)
    : s.posts.filter((p) => r.postText(p).toLowerCase().includes(q) || r.author(p.u).name.toLowerCase().includes(q));
  return (
    <>
      <div className="vhead">
        <h2>{t("explore")}</h2>
      </div>
      <div className="pad">
        <input
          className="field"
          type="search"
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          autoComplete="off"
          value={s.q}
          onChange={(e) => actions.query(e.target.value)}
        />
      </div>
      <div className="chips">
        {trending(s, r).map(([tag]) => (
          <button key={tag} type="button" className={`chip${s.q.toLowerCase() === "#" + tag.toLowerCase() ? " on" : ""}`} onClick={() => actions.tag("#" + tag)}>
            #{tag}
          </button>
        ))}
      </div>
      <div>
        <div className="pad" style={{ paddingBottom: 0 }}>
          <h3 className="sub">{q ? t("results", { count: list.length }) : t("popular")}</h3>
        </div>
        {list.length ? (
          list.map((p) => <Post key={p.id} post={p} open={!!s.open[p.id]} now={now} r={r} actions={actions} reduce={reduce} />)
        ) : (
          <p className="empty">{t("noMatch", { q: s.q })}</p>
        )}
      </div>
      <div className="sect">
        <h3>{t("whoToFollow")}</h3>
        {WHO_TO_FOLLOW.map((h) => (
          <FollowRow key={h} h={h} on={!!s.follows[h]} r={r} actions={actions} />
        ))}
      </div>
    </>
  );
}

/* ---------- Notifications ---------- */

export function Notifications({ s, r, now }: ViewProps) {
  const t = useTranslations("dive.app");
  return (
    <>
      <div className="vhead">
        <h2>{t("nav.notifs")}</h2>
      </div>
      {s.notifs.length ? (
        s.notifs.map((n) => (
          <div key={n.id} className={`notif${n.fresh ? " fresh" : ""}`}>
            <span className={`ni ni-${n.icon}`}>
              <Icon name={n.icon} />
            </span>
            <div>
              <p>{t(`notif.${n.kind}`, { name: r.author(n.who).name })}</p>
              <small>
                <Ago ts={n.ts} now={now} />
              </small>
            </div>
          </div>
        ))
      ) : (
        <p className="empty">{t("notifsEmpty")}</p>
      )}
    </>
  );
}

/* ---------- Messages ---------- */

function Chat({ s, r, actions }: ViewProps) {
  const t = useTranslations("dive.app");
  const h = s.chat!;
  const u = r.author(h);
  const first = u.name.split(" ")[0];
  const [text, setText] = useState("");
  const bubbles = useRef<HTMLDivElement>(null);
  const msgs = s.chats[h];
  const typing = s.chatTyping === h;
  useLayoutEffect(() => {
    const el = bubbles.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    actions.sendMsg(v);
    setText("");
  };
  return (
    <div className="chat">
      <div className="chead">
        <button type="button" className="iconbtn" aria-label={t("backToMessages")} style={{ color: "inherit" }} onClick={actions.chatBack}>
          <Icon name="back" />
        </button>
        <Avatar user={u} />
        <b>{u.name}</b>
      </div>
      <div className="bubbles" ref={bubbles}>
        {msgs.map((m, i) => (
          <div key={i} className={m.f === "me" ? "bub me" : "bub"}>
            {r.chatText(m)}
          </div>
        ))}
        {typing && (
          <div className="bub" aria-label={t("isTyping", { name: first })}>
            <span className="typing">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>
      <form className="mform" onSubmit={submit}>
        <input
          className="field"
          maxLength={200}
          placeholder={t("messagePlaceholder", { name: first })}
          aria-label={t("messageLabel")}
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="pill solid" type="submit">
          {t("send")}
        </button>
      </form>
    </div>
  );
}

export function Messages(props: ViewProps) {
  const { s, r, actions } = props;
  const t = useTranslations("dive.app");
  if (s.chat) return <Chat {...props} />;
  return (
    <>
      <div className="vhead">
        <h2>{t("nav.messages")}</h2>
      </div>
      {CHAT_KEYS.map((h) => {
        const u = r.author(h);
        const last = s.chats[h][s.chats[h].length - 1];
        return (
          <button key={h} type="button" className="chatrow" onClick={() => actions.openChat(h)}>
            <Avatar user={u} />
            <span className="wn">
              <b>{u.name}</b>
              <small>
                {last.f === "me" ? t("youPrefix") : ""}
                {r.chatText(last)}
              </small>
            </span>
            {s.chatUnread[h] > 0 && <span className="dot" aria-label={t("unread")} />}
          </button>
        );
      })}
    </>
  );
}

/* ---------- Profile ---------- */

export function Profile({ s, r, now, actions, reduce }: ViewProps) {
  const t = useTranslations("dive.app");
  const mine = s.posts.filter((p) => p.mine);
  const following = 87 + Object.values(s.follows).filter(Boolean).length;
  const shown = s.editing ? { name: s.editName || r.meName, color: s.editColor } : r.author("me");
  const b = (c: ReactNode) => <b>{c}</b>;
  return (
    <>
      <div className="cover" />
      <div className="prof">
        <div className="top">
          <span>
            <Avatar user={shown} size="xl" />
          </span>
          {!s.editing && (
            <button type="button" className="pill" onClick={actions.editStart}>
              {t("editProfile")}
            </button>
          )}
        </div>
        <h3>{r.meName}</h3>
        <div className="hd">@{r.author("me").handle}</div>
        <div className="stats">
          <span>{t.rich("statPosts", { count: mine.length, b })}</span>
          <span>{t.rich("statFollowing", { count: following, b })}</span>
          <span>{t.rich("statFollowers", { count: 128 + s.followBacks, b })}</span>
        </div>
        {s.editing && (
          <div className="edit">
            <label htmlFor="murmur-pname">{t("displayName")}</label>
            <input id="murmur-pname" className="field" maxLength={24} autoComplete="off" value={s.editName} onChange={(e) => actions.editName(e.target.value)} />
            <label>{t("avatarColour")}</label>
            <div className="swatches">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={c === s.editColor ? "sw on" : "sw"}
                  style={{ background: c }}
                  aria-label={t("colour", { c })}
                  aria-pressed={c === s.editColor}
                  onClick={() => actions.editColor(c)}
                />
              ))}
            </div>
            <div className="row">
              <button type="button" className="pill" onClick={actions.editCancel}>
                {t("cancel")}
              </button>
              <button type="button" className="pill solid" onClick={actions.editSave}>
                {t("save")}
              </button>
            </div>
          </div>
        )}
      </div>
      {mine.length ? (
        mine.map((p) => <Post key={p.id} post={p} open={!!s.open[p.id]} now={now} r={r} actions={actions} reduce={reduce} />)
      ) : (
        <p className="empty">{t("noPosts")}</p>
      )}
    </>
  );
}
