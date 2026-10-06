"use client";
import { useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";

/** A Web 2.0 news site: every bump is an XMLHttpRequest, the list re-sorts without a reload. */
export function Vote() {
  const { t } = useStoryText();
  const { audio } = usePowerOn();
  const [items, setItems] = useState([{ k: "i1", v: 412 }, { k: "i2", v: 377 }, { k: "i3", v: 288 }, { k: "i4", v: 141 }]);
  const [hit, setHit] = useState<{ k: string; n: number } | null>(null);
  const bump = (k: string) => {
    const n = (hit?.n ?? 0) + 1, add = 25 + ((n * 37 + k.length * 11) % 60);
    setItems(items.map((it) => (it.k === k ? { ...it, v: it.v + add } : it)).sort((a, b) => b.v - a.v));
    setHit({ k, n });
    audio.blip(1320);
  };
  return (
    <div className="po-card po-vote" style={{ width: "min(100%, 480px)" }}>
      <div className="po-bar"><span>{t("widgets.vote.bar")} <sup>{t("widgets.vote.beta")}</sup> {t("widgets.vote.top")}</span><span>$.ajax(…)</span></div>
      <div className="po-body">
        <ol>
          {items.map((it) => (
            <li key={hit?.k === it.k ? it.k + hit.n : it.k} className={hit?.k === it.k ? "po-hit" : ""}>
              <div className="po-v">
                <button type="button" aria-label={t("widgets.vote.aria", { title: t(`widgets.vote.${it.k}`) })} onClick={() => bump(it.k)}>{t("widgets.vote.bump")}</button>
                {it.v}
              </div>
              <div className="po-t">{t(`widgets.vote.${it.k}`)}<small>{t(`widgets.vote.${it.k}s`)}</small></div>
            </li>
          ))}
        </ol>
        <small style={{ color: "var(--muted)" }}>{t("widgets.vote.caption")}</small>
      </div>
    </div>
  );
}
