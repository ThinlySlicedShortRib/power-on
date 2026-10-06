"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { KEYS, load, save } from "../engine/storage";

/** Shown when the 3D desk can't use the GPU (WebGL blocked, or emulated in software). Dismissal is remembered. */
export function GpuNotice({ show }: { show: boolean }) {
  const t = useTranslations("common.gpu");
  const [dismissed, setDismissed] = useState(() => load(KEYS.gpuNote) === "1");
  if (!show || dismissed) return null;
  return (
    <div className="po-gpu" role="status">
      <p><b>{t("title")}</b> {t("tip")}</p>
      <button type="button" onClick={() => { save(KEYS.gpuNote, "1"); setDismissed(true); }}>{t("dismiss")}</button>
    </div>
  );
}
