"use client";

import { useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import { ERA_YEARS, RINGS, ringStyle, type EraYear } from "../engine/tunnel";

const TILE_COLORS = ["#3498db", "#e74c3c", "#f1c40f", "#9b59b6", "#1abc9c", "#e67e22"];
const CLOUD_SIZES = [15, undefined, 13, undefined, 16];

/** One mock web page per era, shown on the tunnel walls. */
function EraPage({ year }: { year: EraYear }) {
  const t = useTranslations("dive.eras");
  switch (year) {
    case 2016:
      return (
        <>
          <div className="bar">
            <span>{t("e2016.app")}</span>
            <span>●</span>
          </div>
          <div className="tiles">
            {TILE_COLORS.map((c) => (
              <div key={c} style={{ background: c }} />
            ))}
          </div>
        </>
      );
    case 2010:
      return (
        <>
          <div className="nav">
            <b>{t("e2010.brand")}</b>
            <span>{t("e2010.home")}</span>
            <span>{t("e2010.about")}</span>
            <span>{t("e2010.contact")}</span>
          </div>
          <div className="jumbo">
            <h3>{t("e2010.hello")}</h3>
            <p style={{ margin: "0 0 8px", fontSize: 12 }}>{t("e2010.lead")}</p>
            <span className="btn">{t("e2010.more")}</span>
          </div>
        </>
      );
    case 2006:
      return (
        <>
          <div className="hd">
            {t("e2006.name")}
            <div className="beta">{t("e2006.beta")}</div>
          </div>
          <span className="gel">{t("e2006.signup")}</span>
          <div className="cloud">
            {t("e2006.cloud")
              .split(",")
              .map((w, i) => (
                <span key={w} style={CLOUD_SIZES[i] ? { fontSize: CLOUD_SIZES[i] } : undefined}>
                  {w}
                </span>
              ))}
          </div>
        </>
      );
    case 1997:
      return (
        <>
          <h3>{t("e1997.welcome")}</h3>
          <div className="blink">{t("e1997.new")}</div>
          <div className="uc" />
          <div style={{ fontSize: 12 }}>{t("e1997.guestbook")}</div>
          <div className="ctr">
            {["0", "0", "4", "2", "7"].map((d, i) => (
              <b key={i}>{d}</b>
            ))}
          </div>
        </>
      );
    case 1991:
      return (
        <>
          <h3>{t("e1991.title")}</h3>
          {t.rich("e1991.body", { a: (c: ReactNode) => <a>{c}</a> })}
          <p style={{ margin: "8px 0 0" }}>{t("e1991.more")}</p>
        </>
      );
  }
}

/** Scene 3: CSS-3D time tunnel. Panel placement and the camera are written by the engine. */
export function Tunnel() {
  const t = useTranslations("dive.eras");
  return (
    <section className="scene s-tunnel" aria-hidden="true">
      <div className="world">
        {Array.from({ length: RINGS }, (_, i) => (
          <div key={i} className="ringz" style={ringStyle(i)} />
        ))}
        {ERA_YEARS.map((y) => (
          <Fragment key={y}>
            <div className={`panel p${y}`}>
              <EraPage year={y} />
            </div>
            <div className="tag">
              {y} · {t(`e${y}.tag`)}
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
