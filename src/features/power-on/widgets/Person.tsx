"use client";

import type { PersonId } from "../content/eras";
import { useStoryText } from "../i18n/rich";
import { FACE } from "./util";

export function Person({ id }: { id: PersonId }) {
  const { t, rich } = useStoryText();
  const k = `people.${id}`;
  return (
    <div className="po-card po-person">
      <div className="po-bar"><span>{t("people.introducing")}</span><span>{rich(`${k}.yrs`)}</span></div>
      <div className="po-body">
        <div className="po-face" style={{ color: "var(--muted)" }}>{FACE}<span>{t(`${k}.ini`)}</span></div>
        <div>
          <div className="po-intro">{t("people.character")}</div>
          <h3>{rich(`${k}.name`)}</h3>
          <div className="po-role">{rich(`${k}.role`)}</div>
          <ul style={{ marginTop: 10 }}>
            <li>{rich(`${k}.f1`)}</li>
            <li>{rich(`${k}.f2`)}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
