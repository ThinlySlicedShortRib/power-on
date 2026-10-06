"use client";
import type { Ref } from "react";
import { useStoryText } from "../i18n/rich";

/** "Press space / click to continue", costumed per era. Keycaps flash when their key is pressed. */
export function AdvanceHint({ n, touch, hintRef }: { n: number; touch: boolean; hintRef: Ref<HTMLDivElement> }) {
  const { t, rich } = useStoryText();
  const cur = <> <span className="po-cur" /></>;
  let body;
  if (touch) body = n === 1 ? <>{t("adv.touch1")}{cur}</> : n === 2 ? t("adv.touch2") : t("adv.touch");
  else body = n === 1 ? <>{rich("adv.kb1")}{cur}</> : rich("adv.kb");
  return <div className="po-adv" ref={hintRef} aria-hidden="true">{body}</div>;
}

export function flashKey(hint: HTMLElement | null, k: string, timer: { id: number }) {
  if (!hint) return;
  const node = hint.querySelector(`kbd[data-k="${k}"]`) ?? (k === "next" ? hint.querySelector('kbd[data-k="right"]') : null);
  hint.classList.add("po-peek");
  clearTimeout(timer.id);
  timer.id = window.setTimeout(() => hint.classList.remove("po-peek"), 900);
  if (node) { node.classList.remove("po-hit"); void (node as HTMLElement).offsetWidth; node.classList.add("po-hit"); }
}
