"use client";
import { useStoryText } from "../../i18n/rich";

export function Flat() {
  const { t, rich } = useStoryText();
  return (
    <div className="po-card po-flatdemo" style={{ width: "min(100%, 500px)" }}>
      <div className="po-bar"><span>{rich("props.flat.bar")}</span><span>{rich("props.flat.tag")}</span></div>
      <div className="po-body">
        <div className="po-fd-row">
          <button type="button" className="po-fd-gloss" tabIndex={-1}>{t("props.flat.signup")}</button>
          <span aria-hidden="true">→</span>
          <button type="button" className="po-fd-flat" tabIndex={-1}>{t("props.flat.signup")}</button>
        </div>
        <div className="po-fd-devices" role="img" aria-label={t("props.flat.aria")}>
          <div className="po-d po-d1"><i /><i /><i /></div>
          <div className="po-d po-d2"><i /><i /><i /></div>
          <div className="po-d po-d3"><i /><i /><i /></div>
        </div>
        <small>{rich("props.flat.caption")}</small>
      </div>
    </div>
  );
}
