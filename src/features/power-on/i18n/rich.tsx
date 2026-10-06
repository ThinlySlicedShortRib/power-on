"use client";

import { useTranslations } from "next-intl";
import { useMemo, type ReactNode } from "react";
import { GLOSSARY_IDS } from "../content/glossaryIds";

type Chunks = ReactNode;
type TagFn = (chunks: Chunks) => ReactNode;
export type RichValues = Record<string, string | number | TagFn>;

/** kbd tags used in messages: <k_next>Space</k_next> renders <kbd data-k="next">Space</kbd> (keycaps flash on key press) */
const KBD_IDS = ["next", "right", "back", "help", "enter", "b", "h", "q"] as const;

/** Glossary terms are explicit rich-text tags in messages: <g_http>HTTP</g_http> → <Term id="http">HTTP</Term>. */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <span className="po-gl-term" tabIndex={0} data-term={id}>
      {children}
    </span>
  );
}

function buildTags(): Record<string, TagFn> {
  const tags: Record<string, TagFn> = {
    em: (c) => <em>{c}</em>,
    i: (c) => <i>{c}</i>,
    b: (c) => <b>{c}</b>,
    strong: (c) => <strong>{c}</strong>,
    sup: (c) => <sup>{c}</sup>,
    small: (c) => <small>{c}</small>,
    kbd: (c) => <kbd>{c}</kbd>,
  };
  for (const k of KBD_IDS) tags["k_" + k] = (c) => <kbd data-k={k}>{c}</kbd>;
  for (const id of GLOSSARY_IDS) tags["g_" + id] = (c) => <Term id={id}>{c}</Term>;
  return tags;
}

function buildPlainTags(): Record<string, (c: string) => string> {
  const tags: Record<string, (c: string) => string> = {};
  for (const k of ["em", "i", "b", "strong", "sup", "small", "kbd", ...KBD_IDS.map((k) => "k_" + k), ...GLOSSARY_IDS.map((id) => "g_" + id)]) tags[k] = (c) => c;
  return tags;
}

const TAGS = buildTags();
const PLAIN = buildPlainTags();

export interface StoryText {
  /** plain message (no tags) */
  t: (key: string, values?: Record<string, string | number>) => string;
  /** rich message: glossary terms, emphasis, keycaps */
  rich: (key: string, values?: RichValues) => ReactNode;
  /** message with every tag stripped, e.g. for typing animations, aria and screen-reader text */
  plain: (key: string, values?: Record<string, string | number>) => string;
  has: (key: string) => boolean;
}

export function useStoryText(): StoryText {
  const tr = useTranslations("story");
  return useMemo<StoryText>(() => ({
    t: (key, values) => tr(key, values),
    rich: (key, values) => tr.rich(key, { ...TAGS, ...values } as Parameters<typeof tr.rich>[1]),
    plain: (key, values) => tr.markup(key, { ...PLAIN, ...values } as Parameters<typeof tr.markup>[1]),
    has: (key) => tr.has(key),
  }), [tr]);
}
