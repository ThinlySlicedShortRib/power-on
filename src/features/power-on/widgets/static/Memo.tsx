"use client";
import { useStoryText } from "../../i18n/rich";

export function Memo() {
  const { rich } = useStoryText();
  return (
    <div className="po-memo">
      <span className="po-scrawl">{rich("props.memo.scrawl")}</span>
      <p>{rich("props.memo.meta")}</p>
      <h4>{rich("props.memo.title")}</h4>
      <p>{rich("props.memo.body")}</p>
      <div className="po-boxes"><i /><i /><i /><i /><i /><i /></div>
      <p style={{ marginTop: 10, fontSize: ".78rem" }}>{rich("props.memo.note")}</p>
    </div>
  );
}
