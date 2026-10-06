"use client";
import { useState } from "react";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";
import { Stamp } from "./util";

export function Sticker() {
  const { t, rich } = useStoryText();
  const { audio } = usePowerOn();
  const [off, setOff] = useState(false);
  return (
    <div className="po-sticker">
      <div className="po-cubeface">
        <div className="po-under">{t("widgets.sticker.under1")}<br />{t("widgets.sticker.under2")}</div>
        <button type="button" className={"po-note3d po-peel" + (off ? " po-off" : "")} aria-pressed={off} aria-label={t("widgets.sticker.aria")}
          onClick={() => { setOff(!off); audio.blip(!off ? 300 : 500); }}>
          {t("widgets.sticker.note1")}<br />{t("widgets.sticker.note2")}
        </button>
      </div>
      <div className="po-story-cap"><Stamp /> {rich("widgets.sticker.caption")}</div>
    </div>
  );
}
