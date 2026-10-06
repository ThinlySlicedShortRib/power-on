"use client";
import { GATE_RESPONSE } from "../../content/code";
import { useStoryText } from "../../i18n/rich";
import { Card } from "../util";

export function Gate() {
  const { rich } = useStoryText();
  return (
    <Card width={480} bar={rich("props.gate.bar")} right={rich("props.gate.date")}>
      <pre className="po-resp">{GATE_RESPONSE}</pre>
      <small>{rich("props.gate.caption")}</small>
    </Card>
  );
}
