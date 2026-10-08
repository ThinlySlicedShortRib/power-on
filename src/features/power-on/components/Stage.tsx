"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { PropId } from "../content/eras";
import { PropView } from "../widgets/PropView";

/**
 * Props slide in when their line comes up and fade out when it leaves. Each prop stays mounted (hidden) once
 * visited, so a guestbook entry or a terminal session is still there when the reader scrolls back.
 */
export function Stage({ active }: { active: PropId | null }) {
  const [visited, setVisited] = useState<PropId[]>([]);
  if (active && !visited.includes(active)) setVisited([...visited, active]);
  return (
    <div className="po-stage">
      {visited.map((id) => <PropSlot key={id} id={id} active={id === active} />)}
    </div>
  );
}

function PropSlot({ id, active }: { id: PropId; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.hidden = false;
      el.classList.add("po-out");
      void el.offsetWidth;
      el.classList.remove("po-out");
      return;
    }
    el.classList.add("po-out");
    const t = window.setTimeout(() => { if (el.classList.contains("po-out")) el.hidden = true; }, 600);
    return () => clearTimeout(t);
  }, [active]);
  return (
    <div ref={ref} className="po-prop po-out" aria-hidden={active ? undefined : true} inert={!active}>
      <PropView id={id} active={active} />
    </div>
  );
}
