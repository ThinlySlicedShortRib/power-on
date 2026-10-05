"use client";

import { useTranslations } from "next-intl";
import { CODE, LAYER_IDS } from "./codeSamples";

const WIRE_D = "M-50 300 C 200 120, 380 480, 500 300 S 820 120, 1050 300";

/** Scene 2: the like button's code, layer by layer, then the wire. Styles are driven by the engine. */
export function CodeLayers() {
  const t = useTranslations("dive.layers");
  return (
    <section className="scene s-layers" aria-hidden="true">
      {LAYER_IDS.map((id) => (
        <div key={id} className={id === "http" ? "layer http" : "layer"}>
          <header>
            <span>{t(`${id}.file`)}</span>
            <b>{t(`${id}.era`)}</b>
          </header>
          <pre dangerouslySetInnerHTML={{ __html: CODE[id] }} />
        </div>
      ))}
      <div className="wire">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="dive-wire-grad" x1="0" x2="1">
              <stop offset="0" stopColor="#ffc874" stopOpacity="0" />
              <stop offset=".5" stopColor="#ffc874" />
              <stop offset="1" stopColor="#ffc874" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="wpath" d={WIRE_D} fill="none" stroke="url(#dive-wire-grad)" strokeWidth="3" />
          <path d={WIRE_D} fill="none" stroke="#ffc874" strokeOpacity=".12" strokeWidth="22" />
          <circle className="pkt" r="9" fill="#ffc874" />
        </svg>
      </div>
    </section>
  );
}
