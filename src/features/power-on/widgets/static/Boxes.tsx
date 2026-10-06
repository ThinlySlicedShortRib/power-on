"use client";
import { useStoryText } from "../../i18n/rich";

export function Boxes() {
  const { t } = useStoryText();
  return (
    <div className="po-boxes3">
      {(["web", "api", "worker", "db", "cache", "queue"] as const).map((k) => <i key={k}>{t(`props.boxes.${k}`)}</i>)}
      <i className="po-lam">λ</i>
    </div>
  );
}
