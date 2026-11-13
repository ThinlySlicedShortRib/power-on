"use client";
import { useEffect, useRef } from "react";
import { useStoryText } from "../i18n/rich";

/** "?" panel: keyboard shortcuts (or gestures on touch), costumed for the current era. */
export function Shortcuts({ open, era, intro, touch, narrator = false, onClose }: {
  open: boolean; era: number; intro: boolean; touch: boolean;
  /** the video narrator is on (its feature flag): adds the R row */
  narrator?: boolean;
  onClose: () => void;
}) {
  const { t, rich } = useStoryText();
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const last = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    return () => { last?.focus?.(); };
  }, [open]);
  const K = (k: string, label: string) => <kbd data-k={k}>{label}</kbd>;
  const rows: [React.ReactNode, React.ReactNode][] = touch
    ? [[t("keys.touch.tap"), t("keys.touch.tapDesc")], [t("keys.touch.scroll"), t("keys.touch.scrollDesc")], [t("keys.touch.term"), t("keys.touch.termDesc")], [t("keys.touch.audio"), t("keys.touch.audioDesc")]]
    : [
      [K("enter", t("keys.kb.enter")), t("keys.kb.enterDesc")],
      [<>{K("next", t("keys.kb.space"))}{K("right", "→")}{K("down", "↓")}{K("pgdn", t("keys.kb.pgdn"))}</>, t("keys.kb.nextDesc")],
      [<>{K("back", "←")}{K("up", "↑")}{K("pgup", t("keys.kb.pgup"))}</>, t("keys.kb.backDesc")],
      [K("tab", t("keys.kb.tab")), t("keys.kb.tabDesc")],
      [K("esc", t("keys.kb.esc")), t("keys.kb.escDesc")],
      [K("m", "M"), t("keys.kb.mDesc")],
      [K("s", "S"), t("keys.kb.sDesc")],
      ...(narrator ? [[K("r", "R"), t("keys.kb.rDesc")] as [React.ReactNode, React.ReactNode]] : []),
      [K("help", "?"), t("keys.kb.helpDesc")],
      [<span className="po-kn" key="b">{t("keys.kb.browser")}</span>, rich("keys.kb.browserDesc")],
      [<span className="po-kn" key="e">{t("keys.kb.errand")}</span>, rich("keys.kb.errandDesc")],
    ];
  return (
    <div className={"po-keys" + (intro ? " po-intro" : "")} data-era={era} role="dialog" aria-modal="true" aria-labelledby="po-keys-title" hidden={!open}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="po-kpanel">
        <div className="po-khead">
          <b id="po-keys-title">{touch ? t("keys.titleTouch") : t("keys.titleKb")}</b>
          <button type="button" ref={closeBtn} aria-label={t("keys.closeAria")} onClick={onClose}>{t("keys.close")}</button>
        </div>
        <div className="po-kbody">
          <dl>{rows.map(([dt, dd], i) => <div key={i} style={{ display: "contents" }}><dt>{dt}</dt><dd>{dd}</dd></div>)}</dl>
        </div>
      </div>
    </div>
  );
}
