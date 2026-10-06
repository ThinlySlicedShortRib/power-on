"use client";

import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { clamp } from "../engine/env";

const TIP_ID = "po-tip";

/**
 * One shared glossary tooltip for every <Term>. Hover (mouse/pen), focus or tap shows it; tap/click pins it;
 * Esc, scrolling or clicking elsewhere closes it. Rendered inside the screen layer so each era can skin it.
 */
export function TooltipLayer() {
  const tg = useTranslations("glossary");
  const [tip, setTip] = useState<{ id: string; on: boolean; n: number }>({ id: "", on: false, n: 0 });
  const tipRef = useRef<HTMLDivElement>(null);
  const state = useRef<{ anchor: HTMLElement | null; pinned: boolean }>({ anchor: null, pinned: false });

  useEffect(() => {
    const termOf = (e: Event) => (e.target instanceof Element ? (e.target.closest(".po-gl-term") as HTMLElement | null) : null);
    const show = (term: HTMLElement, pin: boolean) => {
      const id = term.dataset.term;
      if (!id) return;
      const s = state.current;
      if (s.anchor && s.anchor !== term) s.anchor.removeAttribute("aria-describedby");
      s.anchor = term; s.pinned = pin;
      term.setAttribute("aria-describedby", TIP_ID);
      setTip((p) => ({ id, on: true, n: p.n + 1 }));
    };
    const hide = (force: boolean) => {
      const s = state.current;
      if (!s.anchor || (s.pinned && !force)) return;
      s.anchor.removeAttribute("aria-describedby");
      s.anchor = null; s.pinned = false;
      setTip((p) => (p.on ? { ...p, on: false } : p));
    };
    const over = (e: PointerEvent) => { if (e.pointerType === "touch") return; const t = termOf(e); if (t && !state.current.pinned) show(t, false); };
    const out = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const t = termOf(e);
      if (t && t === state.current.anchor && !(e.relatedTarget instanceof Node && t.contains(e.relatedTarget))) hide(false);
    };
    const fin = (e: FocusEvent) => { const t = termOf(e); if (t) show(t, false); };
    const fout = (e: FocusEvent) => { if (termOf(e)) hide(true); };
    const click = (e: MouseEvent) => {
      const t = termOf(e);
      if (t) { if (state.current.anchor === t && state.current.pinned) hide(true); else show(t, true); return; }
      if (state.current.pinned) hide(true);
    };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") hide(true); };
    const scroll = () => hide(true);
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    document.addEventListener("focusin", fin);
    document.addEventListener("focusout", fout);
    document.addEventListener("click", click, true);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scroll, { passive: true });
    const s = state.current;
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("focusin", fin);
      document.removeEventListener("focusout", fout);
      document.removeEventListener("click", click, true);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll);
      s.anchor?.removeAttribute("aria-describedby");
    };
  }, []);

  // place next to the anchor once the era-styled box has its real size
  useLayoutEffect(() => {
    const el = tipRef.current, a = state.current.anchor;
    if (!el || !a || !tip.on) return;
    const r = a.getBoundingClientRect(), tw = el.offsetWidth, th = el.offsetHeight, vw = document.documentElement.clientWidth, vh = innerHeight;
    const x = clamp(r.left + r.width / 2 - tw / 2, 12, Math.max(12, vw - tw - 12));
    let y = r.top - th - 10;
    if (y < 12) y = Math.min(r.bottom + 10, vh - th - 12);
    el.style.left = x + "px";
    el.style.top = Math.max(12, y) + "px";
  }, [tip]);

  const has = tip.id && tg.has(`${tip.id}.term`);
  const kind = has ? tg(`${tip.id}.kind`) : "";
  const year = has ? tg(`${tip.id}.year`) : "";
  return (
    <div ref={tipRef} id={TIP_ID} role="tooltip" className={"po-tip" + (tip.on ? " po-on" : "")}>
      {has ? (
        <>
          <b>
            {tg(`${tip.id}.term`)}
            {kind === "person" ? <span className="po-yr">{tg("_person")}</span> : year ? <span className="po-yr">{year}</span> : null}
          </b>
          {tg(`${tip.id}.def`)}
        </>
      ) : null}
    </div>
  );
}
