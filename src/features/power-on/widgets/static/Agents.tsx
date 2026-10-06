"use client";
import { useStoryText } from "../../i18n/rich";
import { Card } from "../util";

export function Agents() {
  const { rich } = useStoryText();
  return (
    <Card width={500} bar={rich("props.agents.bar")} right={rich("props.agents.tag")}>
      <div className="po-tl">
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="po-tlr" key={i}>
            <span className="po-d">{rich(`props.agents.d${i}`)}</span>
            <span className="po-w"><b>{rich(`props.agents.w${i}`)}</b><small>{rich(`props.agents.s${i}`)}</small></span>
          </div>
        ))}
      </div>
    </Card>
  );
}
