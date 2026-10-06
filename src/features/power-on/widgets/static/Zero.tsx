"use client";
import type { CSSProperties } from "react";
import { useStoryText } from "../../i18n/rich";
import { Card } from "../util";

const ROWS: [string, number][] = [["r1", 15], ["r2", 8], ["r3", 1]];

export function Zero() {
  const { rich } = useStoryText();
  return (
    <Card width={480} bar={rich("props.zero.bar")} right={rich("props.zero.tag")}>
      <div className="po-bars">
        {ROWS.map(([k, v]) => (
          <div key={k}><span>{rich(`props.zero.${k}`)}</span><b style={{ "--v": v } as CSSProperties} /><em>{v}%</em></div>
        ))}
      </div>
      <small>{rich("props.zero.caption")}</small>
    </Card>
  );
}
