"use client";
import { useEffect, useRef, useState } from "react";
import { MODEM_STEPS } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";

/** Dial-up: the handshake you could hear. */
export function Modem() {
  const { t } = useStoryText();
  const { audio, music } = usePowerOn();
  const [step, setStep] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [dialed, setDialed] = useState(false);
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);

  const connect = () => {
    if (busy) return;
    setBusy(true); setStep(-1); setDialed(true);
    music.duck(8.5);
    stop.current = audio.modem(MODEM_STEPS, (i) => {
      setStep(i);
      if (i === MODEM_STEPS.length - 1) setBusy(false);
    });
  };
  const leds = step >= 0 ? MODEM_STEPS[step][2] : 0;
  const done = step === MODEM_STEPS.length - 1;
  const log = step < 0 ? (dialed ? "" : t("widgets.modem.ready")) : MODEM_STEPS.slice(0, step + 1).map((s) => s[1]).join("\n") + "\n" + (done ? "\n" + t("widgets.modem.online") : "");
  return (
    <div className="po-card po-modem">
      <div className="po-bar"><span>{t("widgets.modem.bar")}</span><span>{t("widgets.modem.speed")}</span></div>
      <div className="po-body">
        <div className="po-face" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => <i key={i} className={(i < 2 ? "po-g" : "") + (i < leds ? " po-on" : "")} />)}
        </div>
        <div className="po-log" aria-live="polite">{log}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
          <button className="po-btn" type="button" disabled={busy} onClick={connect}>{done ? t("widgets.modem.again") : t("widgets.modem.connect")}</button>
          <small>{t("widgets.modem.note")}</small>
        </div>
      </div>
    </div>
  );
}
