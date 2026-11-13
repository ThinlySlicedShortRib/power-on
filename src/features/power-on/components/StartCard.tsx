"use client";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export type StartChoice = "sound" | "quiet" | "dismiss";

/**
 * The first thing on every page load: a centred card over the dimmed opening shot. Its click is the gesture the browser
 * needs before anything can make a sound, so the opening waits for it (PowerOn holds the captions, the camera and autoplay
 * until `onChoose`). "Turn sound on" / "Continue without sound" set Sound; Escape or a click on the
 * backdrop just dismiss ("dismiss": Sound left as it is). The language picker reloads the page in that locale, where
 * the card shows again.
 * A modal dialog: the rest of the page is inert while it's up and Tab stays inside it.
 */
export function StartCard({ onChoose, onGone }: {
  onChoose: (c: StartChoice) => void; onGone: () => void;
}) {
  const t = useTranslations("common.welcome");
  const back = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  const inerted = useRef<Element[]>([]);
  const release = () => { inerted.current.forEach((n) => n.removeAttribute("inert")); inerted.current = []; };

  const choose = (c: StartChoice) => {
    if (leaving) return;
    release();
    setLeaving(true);
    onChoose(c);
  };
  const chooseRef = useRef(choose);
  useEffect(() => { chooseRef.current = choose; });

  // everything else in the room goes inert (no focus, no clicks, not read out) until a choice is made
  useEffect(() => {
    const el = back.current, root = el?.parentElement;
    if (!el || !root) return;
    inerted.current = [...root.children].filter((n) => n !== el && !n.hasAttribute("inert"));
    inerted.current.forEach((n) => n.setAttribute("inert", ""));
    return release;
  }, []);

  // Escape dismisses; Tab and Shift+Tab cycle inside the card
  useEffect(() => {
    if (leaving) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); chooseRef.current("dismiss"); return; }
      if (e.key !== "Tab" || !card.current) return;
      const f = [...card.current.querySelectorAll<HTMLElement>("button, select")].filter((n) => !n.hasAttribute("disabled"));
      if (!f.length) return;
      const i = f.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i < 0 || i === f.length - 1 ? 0 : i + 1);
      e.preventDefault();
      f[next].focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leaving]);

  // the fade-out, then gone (a timer, not animationend: reduced motion has no animation)
  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(onGone, 260);
    return () => clearTimeout(id);
  }, [leaving, onGone]);

  return (
    <div ref={back} className="po-start" data-leaving={leaving || undefined} onClick={(e) => { if (e.target === e.currentTarget) choose("dismiss"); }}>
      <div ref={card} className="po-startCard" role="dialog" aria-modal="true" aria-labelledby="po-start-title" aria-describedby="po-start-desc">
        <h2 id="po-start-title">{t("title")}</h2>
        <p id="po-start-desc">{t("sound")}</p>
        <button type="button" className="po-startOn" autoFocus onClick={() => choose("sound")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
          </svg>
          {t("soundOn")}
        </button>
        <button type="button" className="po-startOff" onClick={() => choose("quiet")}>{t("soundOff")}</button>
        <div className="po-startLang">
          <span aria-hidden="true">{t("language")}</span>
          <LanguageSwitcher className="po-startLangsw" id="po-start-language" />
        </div>
      </div>
    </div>
  );
}
