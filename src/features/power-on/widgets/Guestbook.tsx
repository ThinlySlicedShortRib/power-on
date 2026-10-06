"use client";
import { useEffect, useId, useState } from "react";
import { usePowerOn } from "../components/context";
import { KEYS, load, loadJSON, save } from "../engine/storage";
import { useStoryText } from "../i18n/rich";

interface Entry { n: string; f: string; m: string; d: string }

/** A 90s guestbook with a hit counter. Your entries stay in this browser. */
export function Guestbook() {
  const { t } = useStoryText();
  const { audio } = usePowerOn();
  const uid = useId();
  const [visits, setVisits] = useState(() => 4217 + (Number(load(KEYS.visits)) || 0));
  // count this visit once (idempotent, so StrictMode's double effect is harmless)
  const [firstVisits] = useState(visits);
  useEffect(() => { save(KEYS.visits, String(firstVisits - 4216)); }, [firstVisits]);
  const [mine, setMine] = useState<Entry[]>(() => {
    const m = loadJSON<Entry[]>(KEYS.guestbook, []);
    return Array.isArray(m) ? m.filter((e) => e && typeof e.n === "string").slice(0, 12) : [];
  });
  const seed: Entry[] = [
    { n: t("widgets.guest.s1n"), f: t("widgets.guest.s1f"), m: t("widgets.guest.s1m"), d: t("widgets.guest.s1d") },
    { n: t("widgets.guest.s2n"), f: "", m: t("widgets.guest.s2m"), d: t("widgets.guest.s2d") },
  ];
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const n = String(fd.get("n") ?? "").trim(), m = String(fd.get("m") ?? "").trim(), f = String(fd.get("f") ?? "").trim();
    if (!n || !m) return;
    const next = [{ n, f, m, d: new Date().toDateString().slice(4) }, ...mine].slice(0, 12);
    setMine(next);
    save(KEYS.guestbook, JSON.stringify(next));
    e.currentTarget.reset();
    audio.blip(990);
  };
  return (
    <div className="po-card po-gb" style={{ width: "min(100%, 460px)" }}>
      <div className="po-bar"><span>{t("widgets.guest.bar")}</span><span className="po-newbadge">{t("widgets.guest.badge")}</span></div>
      <div className="po-body">
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
          <span>{t("widgets.guest.visitor")}</span>
          <button type="button" className="po-counter" aria-label={t("widgets.guest.counterAria")} onClick={() => { setVisits(visits + 1); audio.blip(1200); }}>
            {String(visits).padStart(6, "0").split("").map((d, i) => <i key={i}>{d}</i>)}
          </button>
        </div>
        <div className="po-entries">
          {[...mine, ...seed].map((e, i) => (
            <div className="po-e" key={i}><b>{e.n}</b> {e.f ? <small>({e.f})</small> : null}<br />{e.m} <small>· {e.d}</small></div>
          ))}
        </div>
        <form onSubmit={submit}>
          <label className="po-sr" htmlFor={uid + "n"}>{t("widgets.guest.name")}</label>
          <input id={uid + "n"} name="n" placeholder={t("widgets.guest.namePh")} maxLength={40} required />
          <label className="po-sr" htmlFor={uid + "f"}>{t("widgets.guest.from")}</label>
          <input id={uid + "f"} name="f" placeholder={t("widgets.guest.fromPh")} maxLength={60} />
          <label className="po-sr" htmlFor={uid + "m"}>{t("widgets.guest.msg")}</label>
          <textarea id={uid + "m"} name="m" placeholder={t("widgets.guest.msgPh")} maxLength={140} required />
          <button className="po-btn" type="submit" style={{ gridColumn: "1/-1" }}>{t("widgets.guest.sign")}</button>
        </form>
      </div>
    </div>
  );
}
