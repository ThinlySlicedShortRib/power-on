import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { ME_HANDLE, USER_COLORS, type AuthorKey, type UserKey } from "./data";
import type { ChatMsg, Me, Post, Reply } from "./state";

/** Shape of the "dive.content" block in messages/<locale>/dive.json (read raw: no ICU parsing of posts). */
export interface Content {
  users: Record<UserKey, string>;
  posts: Record<string, string>;
  seedReplies: Record<string, string>;
  pool: string[];
  stories: Record<UserKey, string[]>;
  chats: Record<string, string[]>;
  botReplies: Record<string, string[]>;
}

export interface Author {
  name: string;
  handle: string;
  color: string;
}

export interface Resolver {
  locale: string;
  content: Content;
  author(k: AuthorKey): Author;
  postText(p: Post): string;
  replyText(r: Reply): string;
  chatText(m: ChatMsg): string;
  fmt(n: number): string;
  meName: string;
}

const lookup = (c: Content, path: string): unknown =>
  path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), c);

/** Resolves content keys to localized strings. Stable per locale + profile. */
export function useResolver(me: Me): Resolver {
  const t = useTranslations("dive");
  const locale = useLocale();
  const content = t.raw("content") as Content;
  const defaultName = t("app.defaultName");
  return useMemo(() => {
    const nf = new Intl.NumberFormat(locale);
    const meName = me.name || defaultName;
    const users = Object.fromEntries(
      (Object.keys(USER_COLORS) as UserKey[]).map((k) => [k, { name: content.users[k], handle: k, color: USER_COLORS[k] }]),
    ) as Record<UserKey, Author>;
    const meAuthor: Author = { name: meName, handle: ME_HANDLE, color: me.color };
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    return {
      locale,
      content,
      meName,
      author: (k) => (k === "me" ? meAuthor : users[k]),
      postText: (p) => p.text ?? str(lookup(content, p.key ?? "")),
      replyText: (r) => r.text ?? str(r.key ? content.seedReplies[r.key] : ""),
      chatText: (m) => {
        if (m.text !== undefined) return m.text;
        if (!m.ref) return "";
        const arr = lookup(content, m.ref[0]);
        return Array.isArray(arr) ? str(arr[m.ref[1]]) : "";
      },
      fmt: (n) => nf.format(n),
    };
  }, [locale, content, defaultName, me.name, me.color]);
}

export const initial = (name: string) => (name.trim().charAt(0) || "?").toUpperCase();
