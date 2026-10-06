"use client";
import { useState } from "react";
import { VIEWS_A11Y, VIEWS_LLMS, VIEWS_TOOLS } from "../content/code";
import { usePowerOn } from "../components/context";
import { useStoryText } from "../i18n/rich";

type Tab = "human" | "a11y" | "tools" | "llms";
const TABS: [Tab, string][] = [["human", "tPerson"], ["a11y", "tA11y"], ["tools", "tTools"], ["llms", "tLlms"]];

/** One shop, four readers: a person, an agent reading the accessibility tree, an agent calling tools, llms.txt. */
export function Views({ initial = "tools" }: { active?: boolean; initial?: Tab }) {
  const { t } = useStoryText();
  const { audio } = usePowerOn();
  const [tab, setTab] = useState<Tab>(initial);
  const teas: [string, string, string][] = [["tea1", "#9bc49a", "$12.00"], ["tea2", "#c9a36b", "$10.00"], ["tea3", "#b28fc4", "$11.00"]];
  return (
    <div className="po-card po-views" style={{ width: "min(100%, 520px)" }}>
      <div className="po-bar"><span>{t("widgets.views.bar")}</span><span>{tab === "human" ? t("widgets.views.asPerson") : t("widgets.views.asAgent")}</span></div>
      <div className="po-vt" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); audio.blip(900); }}>{t(`widgets.views.${label}`)}</button>
        ))}
      </div>
      <div className="po-body" role="tabpanel">
        {tab === "human" ? (
          <div className="po-shop">
            <div className="po-sh"><b>{t("widgets.views.shop")}</b><span>{t("widgets.views.search")}</span><span>{t("widgets.views.cart")}</span></div>
            <div className="po-pr">
              {teas.map(([k, c, p]) => (
                <div key={k}><i style={{ background: c }} />{t(`widgets.views.${k}`)}<em>{p}</em><button type="button" tabIndex={-1}>{t("widgets.views.add")}</button></div>
              ))}
            </div>
          </div>
        ) : <pre>{tab === "a11y" ? VIEWS_A11Y : tab === "tools" ? VIEWS_TOOLS : VIEWS_LLMS}</pre>}
      </div>
    </div>
  );
}
