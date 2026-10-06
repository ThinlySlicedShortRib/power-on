"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { useStoryText } from "../i18n/rich";

export function Card({ cls = "", width, bar, right, children, bodyCls = "", bodyStyle }: {
  cls?: string; width?: number; bar: ReactNode; right?: ReactNode; children: ReactNode; bodyCls?: string; bodyStyle?: CSSProperties;
}) {
  return (
    <div className={"po-card " + cls} style={width ? { width: `min(100%, ${width}px)` } : undefined}>
      <div className="po-bar"><span>{bar}</span><span>{right}</span></div>
      <div className={"po-body " + bodyCls} style={bodyStyle}>{children}</div>
    </div>
  );
}

export function Stamp() {
  const { t } = useStoryText();
  return <span className="po-story-stamp">{t("trueStory")}</span>;
}

/** setTimeout/rAF bookkeeping that is cleared on unmount (and on demand). */
export function useTimers() {
  const ids = useRef<{ t: number[]; r: number[] }>({ t: [], r: [] });
  const api = useMemo(() => ({
    set(fn: () => void, ms: number) { const id = window.setTimeout(fn, ms); ids.current.t.push(id); return id; },
    raf(fn: FrameRequestCallback) { const id = requestAnimationFrame(fn); ids.current.r.push(id); return id; },
    clear() { ids.current.t.forEach(clearTimeout); ids.current.r.forEach(cancelAnimationFrame); ids.current = { t: [], r: [] }; },
  }), []);
  useEffect(() => () => api.clear(), [api]);
  return api;
}

/** Run `fn` every time the prop comes on stage (like the prototype's _show hook). */
export function useOnShow(active: boolean, fn: () => void | (() => void)) {
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });
  useEffect(() => {
    if (!active) return;
    return fnRef.current() ?? undefined;
  }, [active]);
}

export const FACE = (
  <svg viewBox="0 0 112 136" aria-hidden="true">
    <circle cx="56" cy="50" r="24" fill="currentColor" opacity=".55" />
    <path d="M14 136c4-30 22-44 42-44s38 14 42 44z" fill="currentColor" opacity=".45" />
  </svg>
);
