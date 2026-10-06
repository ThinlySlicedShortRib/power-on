"use client";
import { useLocale } from "next-intl";
import { useRef, useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { useTimers } from "./util";

/** the fake network round trip */
const RTT = 1400;

/** Optimistic UI: the reader's like (carried from murmur) updates on screen at once; the server confirms later. */
export function Optimistic() {
  const { t } = useStoryText();
  const { audio, like } = usePowerOn();
  const nf = new Intl.NumberFormat(useLocale());
  const timers = useTimers();
  // starts just before the reader's like, so the first tap is that like again
  const [on, setOn] = useState(false);
  const [n, setN] = useState(like.liked ? like.likes - 1 : like.likes);
  // taps so far; the server confirms the newest one only
  const [s, setS] = useState({ tap: 0, ok: false });
  const latest = useRef(0);
  const tap = () => {
    const next = !on, k = s.tap + 1;
    setOn(next);
    setN(n + (next ? 1 : -1));
    setS({ tap: k, ok: false });
    latest.current = k;
    audio.blip(next ? 1500 : 700);
    timers.set(() => { if (latest.current !== k) return; setS({ tap: k, ok: true }); audio.blip(1900); }, RTT);
  };
  const waiting = s.tap > 0 && !s.ok;
  return (
    <div className="po-card po-optim" style={{ width: "min(100%, 440px)" }}>
      <div className="po-bar"><span>{t("widgets.optim.bar")}</span><span>{t("widgets.optim.span")}</span></div>
      <div className="po-body">
        <button type="button" className={"po-oheart" + (on ? " po-on" : "")} aria-pressed={on} aria-label={t("widgets.optim.like")} onClick={tap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
          <span key={n}>{nf.format(n)}</span>
        </button>
        <dl className="po-orows" aria-live="polite">
          <div><dt>{t("widgets.optim.screen")}</dt><dd>{s.tap ? t("widgets.optim.instant") : t("widgets.optim.hint")}</dd></div>
          <div className={waiting ? "po-wait" : ""}>
            <dt>{t("widgets.optim.server")}</dt>
            <dd>{!s.tap ? "—" : waiting ? t("widgets.optim.waiting") : t("widgets.optim.confirmed", { ms: nf.format(RTT) })}</dd>
            <i key={s.tap} style={{ animationDuration: RTT + "ms" }} />
          </div>
        </dl>
      </div>
    </div>
  );
}
