"use client";
import { useStoryText } from "../../i18n/rich";

const row = { display: "flex", justifyContent: "space-between", gap: 12 } as const;

export function Aws() {
  const { rich } = useStoryText();
  const r = (k: string, bold?: boolean) => (
    <div style={bold ? { ...row, fontWeight: 700 } : row}><span>{rich(`props.aws.${k}`)}</span><span>{rich(`props.aws.${k}v`)}</span></div>
  );
  return (
    <div className="po-card" style={{ width: "min(100%, 400px)" }}>
      <div className="po-bar"><span>{rich("props.aws.bar")}</span><span>{rich("props.aws.paid")}</span></div>
      <div className="po-body" style={{ fontFamily: "var(--f-mono)", fontSize: ".85rem" }}>
        {r("r1")}{r("r2")}{r("r3")}
        <hr style={{ border: 0, borderTop: "1px dashed currentColor", width: "100%" }} />
        {r("r4", true)}
        <small style={{ color: "var(--muted)" }}>{rich("props.aws.note")}</small>
      </div>
    </div>
  );
}
