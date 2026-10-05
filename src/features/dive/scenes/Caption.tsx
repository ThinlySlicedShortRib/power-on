"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import type { CaptionKey } from "../engine/timeline";

const i = (c: ReactNode) => <i>{c}</i>;

/** The big caption at the bottom. Fades out, swaps text, fades back in. */
export function Caption({ value, reduce }: { value: CaptionKey | null; reduce: boolean }) {
  const t = useTranslations("dive.captions");
  const [shown, setShown] = useState<CaptionKey | null>(null);
  const out = shown !== value || !shown;
  useEffect(() => {
    const h = window.setTimeout(() => setShown(value), reduce ? 0 : 180);
    return () => window.clearTimeout(h);
  }, [value, reduce]);
  return (
    <div className="cap" aria-live="polite">
      <p className={out ? "out" : undefined}>{shown ? t.rich(shown, { i }) : null}</p>
    </div>
  );
}
