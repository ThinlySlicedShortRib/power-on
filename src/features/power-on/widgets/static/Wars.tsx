"use client";
import { useStoryText } from "../../i18n/rich";

export function Wars() {
  const { rich } = useStoryText();
  return (
    <div className="po-card po-wars" style={{ width: "min(100%, 500px)" }}>
      <div className="po-bar"><span>{rich("props.wars.bar")}</span><span>{rich("props.wars.year")}</span></div>
      <div className="po-body">
        <div className="po-wars-grid">
          <div><b>{rich("props.wars.ns")}</b><code>{"<blink>"}</code><p className="po-blinky">{rich("props.wars.nsText")}</p></div>
          <div><b>{rich("props.wars.ie")}</b><code>{"<marquee>"}</code><p className="po-marq"><span>{rich("props.wars.ieText")}</span></p></div>
        </div>
        <small>{rich("props.wars.caption")}</small>
      </div>
    </div>
  );
}
