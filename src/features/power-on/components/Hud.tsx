"use client";
import { useEffect, useRef, useState } from "react";
import { ERAS } from "../content/eras";
import { useStoryText } from "../i18n/rich";

/**
 * The era badge, bottom-left (top-left on phones): the current era and six pips. It is also the way to any era:
 * it opens a list of all six and choosing one jumps to that era's title card. Costumed per era (data-era 1–6).
 * The controls are the shared bar (features/controls).
 */
export function Hud({ on, era: i, onJump }: { on: boolean; era: number; onJump: (era: number) => void }) {
  const { t } = useStoryText();
  const era = ERAS[i];
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const items = () => Array.from(list.current?.querySelectorAll("button") ?? []);

  // leaving the story closes it
  const [wasOn, setWasOn] = useState(on);
  if (on !== wasOn) { setWasOn(on); if (!on) setOpen(false); }

  // opening moves focus to the current era
  useEffect(() => { if (open) items()[i]?.focus(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = (refocus: boolean) => { setOpen(false); if (refocus) toggle.current?.focus(); };
  const choose = (j: number) => { close(true); onJump(j); };

  const onListKey = (e: React.KeyboardEvent) => {
    const all = items(), at = all.indexOf(document.activeElement as HTMLButtonElement);
    const to = e.key === "ArrowDown" ? at + 1 : e.key === "ArrowUp" ? at - 1 : e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : null;
    if (to == null) return;
    e.preventDefault();
    all[(to + all.length) % all.length]?.focus();
  };

  return (
    <nav className={"po-hudEra" + (on ? " po-on" : "") + (open ? " po-open" : "")} data-era={era.n} aria-label={t("hud.navAria")} inert={!on}
      onKeyDown={(e) => { if (e.key === "Escape" && open) { e.preventDefault(); close(true); } }}
      onBlur={(e) => { if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false); }}>
      {/* outside taps close the list without reaching the story underneath (which would advance it) */}
      <div className="po-hudScrim" hidden={!open} onClick={() => close(false)} />
      <button ref={toggle} type="button" className="po-hudBtn" aria-expanded={open} aria-controls="po-eralist"
        aria-label={t("hud.toggleAria", { name: t(`eras.${era.key}.name`), span: t(`eras.${era.key}.span`) })}
        onClick={() => (open ? close(true) : setOpen(true))}
        // keep focus in the list while it's open, so Safari's blur (it doesn't focus clicked buttons) can't close it first and the click reopen it
        onMouseDown={(e) => { if (open) e.preventDefault(); }}
        onKeyDown={(e) => { if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); setOpen(true); } }}>
        <span className="po-yr">{t(`eras.${era.key}.span`)}</span>
        <span className="po-hudName">{t(`eras.${era.key}.name`)}</span>
        <span className="po-pips" aria-hidden="true">{ERAS.map((_, j) => <i key={j} className={j <= i ? "po-on" : ""} />)}</span>
        <svg className="po-hudCaret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 8l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="po-eras" hidden={!open}>
        <b id="po-eras-title" className="po-erasHead">{t("hud.jump")}</b>
        <ul ref={list} id="po-eralist" aria-labelledby="po-eras-title" onKeyDown={onListKey}>
          {ERAS.map((e, j) => (
            <li key={e.key}>
              <button type="button" aria-current={j === i ? "step" : undefined} onClick={() => choose(j)}>
                <span className="po-erasYr">{t(`eras.${e.key}.span`)}</span>
                <span className="po-erasName">{t(`eras.${e.key}.name`)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
