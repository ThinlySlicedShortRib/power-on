"use client";
import { useEffect, useId, useRef, useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";

const PAGE_KEYS: Record<string, string> = { home: "home", "1": "p1", "2": "p2", "3": "p3", "4": "p4", "5": "p5", "6": "p6" };

/** Nicola Pellow's line-mode browser: links are numbers you type. */
export function Terminal() {
  const { t, rich } = useStoryText();
  const { audio } = usePowerOn();
  const inputId = useId();
  const page = (k: string) => t(`widgets.term.${PAGE_KEYS[k]}`) + "\n\n" + t("widgets.term.prompt");
  const [out, setOut] = useState(() => page("home"));
  const [hist, setHist] = useState<string[]>([]);
  const [val, setVal] = useState("");
  const outRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const o = outRef.current; if (o) o.scrollTop = o.scrollHeight; }, [out]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = val.trim().toLowerCase();
    setVal("");
    audio.blip(660);
    let add = v;
    let h = hist;
    if (PAGE_KEYS[v] && v !== "home") { h = [...hist, v]; add += "\n\n" + page(v); }
    else if (v === "b" || v === "back") { h = hist.slice(0, -1); add += "\n\n" + page(h[h.length - 1] || "home"); }
    else if (v === "h" || v === "home") { h = []; add += "\n\n" + page("home"); }
    else if (v === "q" || v === "quit") add += "\n\n" + t("widgets.term.quit");
    else add += "\n" + t("widgets.term.unknown") + "\n" + t("widgets.term.prompt");
    setHist(h);
    setOut(out + add);
  };

  return (
    <div className="po-term">
      <div className="po-out" ref={outRef}>{out}</div>
      <form onSubmit={submit}>
        <span>&gt;</span>
        <label className="po-sr" htmlFor={inputId}>{t("widgets.term.label")}</label>
        <input id={inputId} autoComplete="off" inputMode="text" placeholder="1" value={val} onChange={(e) => setVal(e.target.value)} />
      </form>
      <div className="po-kcue"><span className="po-kbonly">{rich("widgets.term.cueKb")}</span><span className="po-touchonly">{t("widgets.term.cueTouch")}</span></div>
    </div>
  );
}
