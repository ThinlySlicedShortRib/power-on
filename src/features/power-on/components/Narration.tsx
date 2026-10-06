"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CONF_KEYS, ERAS, type EraDef } from "../content/eras";
import { useStoryText, type StoryText } from "../i18n/rich";

export interface StoryPos {
  era: number;
  /** -1 = era title card */
  beat: number;
  /** type the newest line in (only when moving forward) */
  typed: boolean;
}

/** Narration: era title, the current line typed in (streamed word by word in the future era), two fading older lines, then the Advance button. */
export function Narration({ pos, reduce, advance }: { pos: StoryPos; reduce: boolean; advance?: ReactNode }) {
  const text = useStoryText();
  const era = ERAS[pos.era];
  const b = pos.beat;
  const lines = era.lines;
  const cur = b >= 0 ? lines[b] : null;
  const shown = [];
  if (b >= 0) for (let i = Math.max(0, b - 2); i <= b; i++) shown.push(i);
  const sr = cur
    ? (cur.story ? text.plain("srTrueStory", { line: text.plain(`lines.${cur.id}`) }) : text.plain(`lines.${cur.id}`))
    : text.plain("srEraTitle", { title: text.t(`eras.${era.key}.title`), name: text.t(`eras.${era.key}.name`), span: text.t(`eras.${era.key}.span`) });

  return (
    <div className={"po-narr" + (b < 0 ? " po-title" : "")}>
      <div className="po-eratitle">
        {text.t(`eras.${era.key}.title`)}
        <b>{text.t(`eras.${era.key}.name`)}</b>
      </div>
      <div className="po-lines">
        {era.n === 6 ? <ConfMeter era={era} beat={b} text={text} /> : null}
        {cur?.story ? <div className="po-tstory">{text.t("trueStory")}</div> : null}
        {shown.map((i) => (
          <Line
            key={lines[i].id}
            id={lines[i].id}
            cls={i === b - 1 ? " po-old" : i === b - 2 ? " po-old2" : ""}
            typing={i === b && pos.typed && !reduce}
            stream={era.n === 6}
            text={text}
          />
        ))}
      </div>
      {advance}
      <p className="po-sr" aria-live="polite">{sr}</p>
    </div>
  );
}

function Line({ id, cls, typing, stream, text }: { id: string; cls: string; typing: boolean; stream: boolean; text: StoryText }) {
  const [done, setDone] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLSpanElement>(null);
  const plain = text.plain(`lines.${id}`);

  useEffect(() => {
    const node = typeRef.current, line = lineRef.current;
    if (!typing || done || !node || !line) return;
    let raf = 0;
    const t0 = performance.now();
    if (stream) {
      // the future streams in word by word, like a model's output
      const words = plain.split(/(\s+)/), per = Math.min(70, 1500 / words.length);
      line.classList.add("po-streaming");
      const step = (now: number) => {
        const n = Math.min(words.length, Math.floor((now - t0) / per));
        while (node.childNodes.length < n) {
          const s = document.createElement("span");
          s.className = "po-tok";
          s.textContent = words[node.childNodes.length];
          node.appendChild(s);
        }
        if (n < words.length) raf = requestAnimationFrame(step);
        else { line.classList.remove("po-streaming"); setDone(true); }
      };
      raf = requestAnimationFrame(step);
    } else {
      const per = Math.min(24, 1400 / Math.max(1, plain.length));
      const cur = document.createElement("span");
      cur.className = "po-cur";
      const step = (now: number) => {
        const n = Math.min(plain.length, Math.floor((now - t0) / per));
        node.textContent = plain.slice(0, n);
        node.appendChild(cur);
        if (n < plain.length) raf = requestAnimationFrame(step);
        else setDone(true);
      };
      raf = requestAnimationFrame(step);
    }
    return () => { cancelAnimationFrame(raf); line.classList.remove("po-streaming"); node.textContent = ""; };
  }, [typing, done, stream, plain]);

  return (
    <div ref={lineRef} className={"po-line" + cls}>
      {typing && !done ? <span ref={typeRef} /> : text.rich(`lines.${id}`)}
    </div>
  );
}

function ConfMeter({ era, beat, text }: { era: EraDef; beat: number; text: StoryText }) {
  const lines = era.lines, idx = Math.max(0, beat), cur = lines[idx], c = cur.confidence ?? 0;
  const same = lines.filter((x) => (x.confidence ?? 0) === c), k = same.indexOf(cur);
  const pos = beat < 0 ? 0 : ((c + (k + 0.5) / same.length) / 4) * 100;
  const level = text.t(`conf.${CONF_KEYS[beat < 0 ? 0 : c]}`);
  return (
    <div className="po-conf" role="img" aria-label={text.t("conf.aria", { level })}>
      <div className="po-ct">
        {CONF_KEYS.map((key, i) => (
          <span key={key} className={beat >= 0 && i === c ? "po-on" : ""}>{text.t(`conf.${key}`)}</span>
        ))}
      </div>
      <div className="po-cb"><i style={{ left: pos.toFixed(1) + "%" }} /></div>
    </div>
  );
}
