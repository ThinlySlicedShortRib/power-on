"use client";
import { useStoryText } from "../../i18n/rich";

const ITEMS: [string, string][] = [
  ["y1", "M8 10h34v28H8zM48 10h18v38H48zM14 44h22"], ["y2", "M6 8h40v32H6zM52 6h16v44H52zM10 46h32v6H10z"], ["y3", "M10 8h50v32H10zM4 42h62v6H4z"],
  ["y4", "M10 8h44v30H10zM4 40h56v5H4zM60 18h10v26H60z"], ["y5", "M12 10h46v30H12zM6 42h58v3H6zM62 6a6 6 0 1 0 0.1 0"],
  ["y6", "M6 34a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M30 34a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M24 34h6M58 18a8 8 0 1 0 0.1 0M50 18a12 4 0 1 0 0.1 0"],
];

export function Lineup() {
  const { t } = useStoryText();
  return (
    <div className="po-lineup" role="img" aria-label={t("props.lineup.aria")}>
      {ITEMS.map(([k, d]) => (
        <div key={k}>
          <svg viewBox="0 0 74 56" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--fg)" }} aria-hidden="true"><path d={d} /></svg>
          {t(`props.lineup.${k}`)}
        </div>
      ))}
    </div>
  );
}
