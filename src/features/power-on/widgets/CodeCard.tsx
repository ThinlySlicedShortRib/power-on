"use client";

import { CODE } from "../content/code";
import type { CodeId } from "../content/eras";
import { useStoryText } from "../i18n/rich";

export function CodeCard({ id }: { id: CodeId }) {
  const { t } = useStoryText();
  const c = CODE[id];
  return (
    <div className={"po-card" + (c.next ? " po-next" : "")}>
      <div className="po-bar"><span>{t(`code.${id}`)}</span><span aria-hidden="true">● ● ●</span></div>
      <div className="po-body"><pre>{c.src}</pre></div>
    </div>
  );
}
