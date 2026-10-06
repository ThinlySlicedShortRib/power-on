"use client";
import { useStoryText } from "../../i18n/rich";

export function Phone2007() {
  const { rich } = useStoryText();
  return (
    <div className="po-phone2007">
      <div>
        <b>{rich("props.phone.title")}</b>
        {rich("props.phone.text")}
        <br /><br />
        {rich("props.phone.links")}
      </div>
    </div>
  );
}
