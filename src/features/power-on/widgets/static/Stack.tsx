"use client";
import { useStoryText } from "../../i18n/rich";

export function Stack() {
  const { rich } = useStoryText();
  return (
    <div className="po-card" style={{ width: "min(100%, 460px)" }}>
      <div className="po-bar"><span>{rich("props.stack.bar")}</span><span>{rich("props.stack.tag")}</span></div>
      <div className="po-body po-tree">
        {["t1", "t2", "t3", "t4", "t5", "t6"].map((k) => <div key={k}>{rich(`props.stack.${k}`)}</div>)}
      </div>
    </div>
  );
}
