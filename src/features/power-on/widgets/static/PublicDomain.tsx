"use client";
import { useStoryText } from "../../i18n/rich";

export function PublicDomain() {
  const { rich } = useStoryText();
  return (
    <div className="po-stamp">
      <div>
        {rich("props.pd.date")}
        <b>{rich("props.pd.big1")}<br />{rich("props.pd.big2")}</b>
        {rich("props.pd.text")}
      </div>
    </div>
  );
}
