"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import type { CaptionKey } from "../engine/timeline";

const i = (c: ReactNode) => <i>{c}</i>;

/**
 * The dive's narration line (in the copy column) under its chapter label ("Chapter 0 · Today"), with the Advance
 * button under it. Fades out, swaps text, fades back in.
 */
export function Caption({ value, reduce, children }: { value: CaptionKey | null; reduce: boolean; children?: ReactNode }) {
  const t = useTranslations("dive.captions");
  const tc = useTranslations("dive");
  const [shown, setShown] = useState<CaptionKey | null>(null);
  const out = shown !== value || !shown;
  useEffect(() => {
    const h = window.setTimeout(() => setShown(value), reduce ? 0 : 180);
    return () => window.clearTimeout(h);
  }, [value, reduce]);
  return (
    <div className="cap" aria-live="polite">
      <div className="chap">{tc("chapter")}</div>
      <p className={out ? "out" : undefined}>{shown ? t.rich(shown, { i }) : null}</p>
      {children}
    </div>
  );
}
