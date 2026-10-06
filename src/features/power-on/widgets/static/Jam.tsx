"use client";
import { Fragment } from "react";
import { useStoryText } from "../../i18n/rich";

export function Jam() {
  const { rich } = useStoryText();
  return (
    <div className="po-card" style={{ width: "min(100%, 500px)" }}>
      <div className="po-bar"><span>{rich("props.jam.bar")}</span><span>{rich("props.jam.year")}</span></div>
      <div className="po-body">
        <div className="po-flow">
          {["s1", "s2", "s3", "s4", "s5"].map((k, i) => (
            <Fragment key={k}>{i ? <i>→</i> : null}<span>{rich(`props.jam.${k}`)}</span></Fragment>
          ))}
        </div>
        <small>{rich("props.jam.caption")}</small>
      </div>
    </div>
  );
}
