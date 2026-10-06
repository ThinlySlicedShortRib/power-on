// Story structure. No prose here: every line's text lives at story.lines.<id> in messages/<locale>/story.json,
// era labels at story.eras.<eraKey>, transition captions at story.trans.t<n>.

export type PersonId =
  | "tbl" | "pellow" | "andreessen" | "lerdorf" | "eich" | "garrett" | "resig" | "dhh" | "dahl" | "walke" | "you" | "rauch" | "harris";
export type CodeId = "html" | "cgi" | "font" | "xhr" | "rsc";
export type StaticId =
  | "cern" | "memo" | "usenet" | "pd" | "crash" | "wars" | "aws" | "phone" | "flat" | "boxes" | "jam" | "stack"
  | "agents" | "checkout" | "zero" | "gate" | "lineup";
export type WidgetId =
  | "sticker" | "term" | "coffee" | "modem" | "slow" | "tenday" | "guest" | "gmail" | "map" | "vote" | "npm" | "jsx" | "blank" | "feed"
  | "pend" | "outage" | "stream" | "deploy" | "agent" | "views" | "genui" | "pend3" | "haggle";
export type DioramaId = 1 | 2 | 3 | 4 | 5 | 6;

/** What sits on the stage next to a narration line. */
export type PropId =
  | `p-${PersonId}`
  | `c-${CodeId}`
  | `ph-${StaticId}`
  | `w-${WidgetId}`
  | `dg${DioramaId}`;

/** Future-era confidence: 0 observed · 1 emerging · 2 plausible · 3 wild guess */
export type Confidence = 0 | 1 | 2 | 3;

export interface LineDef {
  /** key into story.lines */
  id: string;
  prop?: PropId;
  /** shows the "True story" badge */
  story?: true;
  confidence?: Confidence;
}

export interface EraDef {
  /** 1-based era number; drives data-era costumes, desk rig, music track */
  n: 1 | 2 | 3 | 4 | 5 | 6;
  /** key into story.eras */
  key: "e1" | "e2" | "e3" | "e4" | "e5" | "e6";
  lines: LineDef[];
}

const L = (id: string, prop: PropId, extra: Partial<LineDef> = {}): LineDef => ({ id, prop, ...extra });
const S = { story: true } as const;

export const ERAS: EraDef[] = [
  { n: 1, key: "e1", lines: [
    L("e1l01", "ph-cern"), L("e1l02", "ph-cern"), L("e1l03", "p-tbl"), L("e1l04", "ph-memo"), L("e1l05", "c-html"),
    L("e1l06", "c-html"), L("e1l07", "dg1"), L("e1l08", "w-sticker", S), L("e1l09", "p-pellow"), L("e1l10", "w-term"),
    L("e1l11", "ph-usenet"), L("e1l12", "w-coffee", S), L("e1l13", "w-coffee", S), L("e1l14", "ph-pd"), L("e1l15", "w-coffee", S),
  ] },
  { n: 2, key: "e2", lines: [
    L("e2l01", "p-andreessen"), L("e2l02", "w-modem"), L("e2l03", "w-slow"), L("e2l04", "c-cgi"), L("e2l05", "c-cgi"),
    L("e2l06", "p-lerdorf"), L("e2l07", "p-eich"), L("e2l08", "w-tenday", S), L("e2l09", "ph-wars"), L("e2l10", "c-font"),
    L("e2l11", "dg2"), L("e2l12", "w-guest"), L("e2l13", "ph-crash"),
  ] },
  { n: 3, key: "e3", lines: [
    L("e3l01", "w-gmail", S), L("e3l02", "c-xhr"), L("e3l03", "p-garrett"), L("e3l04", "w-map"), L("e3l05", "p-resig"),
    L("e3l06", "w-vote"), L("e3l07", "p-dhh"), L("e3l08", "dg3"), L("e3l09", "ph-aws"), L("e3l10", "ph-phone"),
  ] },
  { n: 4, key: "e4", lines: [
    L("e4l01", "p-dahl"), L("e4l02", "w-npm", S), L("e4l03", "p-walke"), L("e4l04", "w-jsx", S), L("e4l05", "w-blank"),
    L("e4l06", "w-blank"), L("e4l07", "p-you"), L("e4l08", "dg4"), L("e4l09", "ph-flat"), L("e4l10", "w-feed"), L("e4l11", "ph-boxes"),
  ] },
  { n: 5, key: "e5", lines: [
    L("e5l01", "p-rauch"), L("e5l02", "w-pend"), L("e5l03", "ph-jam"), L("e5l04", "p-harris"), L("e5l05", "w-outage", S),
    L("e5l06", "w-outage", S), L("e5l07", "w-stream"), L("e5l08", "c-rsc"), L("e5l09", "dg5"), L("e5l10", "dg5"),
    L("e5l11", "ph-stack"), L("e5l12", "w-deploy"),
  ] },
  { n: 6, key: "e6", lines: [
    L("e6l01", "ph-agents", { confidence: 0 }), L("e6l02", "w-agent", { confidence: 0 }), L("e6l03", "ph-checkout", { confidence: 0, story: true }),
    L("e6l04", "ph-zero", { confidence: 0 }), L("e6l05", "ph-gate", { confidence: 0 }), L("e6l06", "w-views", { confidence: 1 }),
    L("e6l07", "dg6", { confidence: 1 }), L("e6l08", "w-genui", { confidence: 2 }), L("e6l09", "w-pend3", { confidence: 2 }),
    L("e6l10", "w-haggle", { confidence: 3 }), L("e6l11", "ph-lineup", { confidence: 3 }),
  ] },
];

/** Transition captions between era i and i+1 live at story.trans.t{i+1}. */
export const TRANS_KEYS = ["t1", "t2", "t3", "t4", "t5"] as const;

export const CONF_KEYS = ["observed", "emerging", "plausible", "wild"] as const;
