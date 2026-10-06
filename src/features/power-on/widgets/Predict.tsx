"use client";
import { useId, useState } from "react";
import { KEYS, loadJSON, save } from "../engine/storage";
import { useStoryText } from "../i18n/rich";

const G = ["haggle", "throwaway", "agentos", "robots2", "m2m"] as const;

/** Rate the wild guesses. Saved in this browser only. */
export function Predict({ embedded }: { embedded?: boolean }) {
  const { t } = useStoryText();
  const uid = useId();
  const [vals, setVals] = useState<Record<string, number>>(() => {
    const s = loadJSON<Record<string, number>>(KEYS.predict, {});
    return Object.fromEntries(G.map((k) => [k, typeof s[k] === "number" ? s[k] : 50]));
  });
  const m = Math.round(G.reduce((a, k) => a + vals[k], 0) / G.length);
  const label = t(`widgets.predict.${m >= 70 ? "optimist" : m <= 30 ? "skeptic" : "hedging"}`);
  const set = (k: string, v: number) => { const next = { ...vals, [k]: v }; setVals(next); save(KEYS.predict, JSON.stringify(next)); };
  return (
    <div className={(embedded ? "" : "po-card ") + "po-predict"} style={{ width: embedded ? "100%" : "min(100%, 500px)" }}>
      <div className="po-bar"><span>{t("widgets.predict.bar")}</span><span>{t("widgets.predict.avg", { label, m })}</span></div>
      <div className="po-body">
        {G.map((k) => (
          <label className="po-pr" htmlFor={uid + k} key={k}>
            <span>{t(`widgets.predict.${k}`)}</span>
            <input type="range" min={0} max={100} step={5} id={uid + k} value={vals[k]} onChange={(e) => set(k, Number(e.target.value))} />
            <em>{vals[k]}%</em>
          </label>
        ))}
        <small>{t("widgets.predict.note")}</small>
      </div>
    </div>
  );
}
