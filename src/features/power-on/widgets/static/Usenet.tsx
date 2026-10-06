"use client";
import { useStoryText } from "../../i18n/rich";

export function Usenet() {
  const { rich } = useStoryText();
  return (
    <div className="po-usenet">
      {rich("props.usenet.text")}
      <b style={{ color: "#ffd23d" }}>{rich("props.usenet.actions")}</b>
    </div>
  );
}
